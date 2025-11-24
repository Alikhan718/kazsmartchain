import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface BesuTransaction {
  from?: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: string;
}

export interface BesuRpcResponse<T = any> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

@Injectable()
export class BesuService {
  private readonly logger = new Logger(BesuService.name);
  private readonly rpcUrl: string;
  private readonly client: AxiosInstance;

  constructor() {
    this.rpcUrl = process.env.BESU_RPC_URL || 'http://localhost:8545';
    this.client = axios.create({
      baseURL: this.rpcUrl,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Выполняет JSON-RPC запрос к Besu
   */
  private async rpcCall<T = any>(method: string, params: any[] = []): Promise<T> {
    try {
      const response = await this.client.post<BesuRpcResponse<T>>('', {
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      });

      if (response.data.error) {
        throw new Error(`Besu RPC Error: ${response.data.error.message} (code: ${response.data.error.code})`);
      }

      return response.data.result as T;
    } catch (error: any) {
      this.logger.error(`RPC call failed: ${method}`, error.message);
      throw error;
    }
  }

  /**
   * Получает номер последнего блока
   */
  async getBlockNumber(): Promise<string> {
    return this.rpcCall<string>('eth_blockNumber');
  }

  /**
   * Получает информацию о блоке
   */
  async getBlock(blockNumber: string | 'latest' | 'earliest' | 'pending', fullTransactions = false) {
    return this.rpcCall('eth_getBlockByNumber', [blockNumber, fullTransactions]);
  }

  /**
   * Получает информацию о транзакции по хешу
   */
  async getTransaction(txHash: string) {
    return this.rpcCall('eth_getTransactionByHash', [txHash]);
  }

  /**
   * Получает квитанцию транзакции
   */
  async getTransactionReceipt(txHash: string) {
    return this.rpcCall('eth_getTransactionReceipt', [txHash]);
  }

  /**
   * Получает баланс аккаунта
   */
  async getBalance(address: string, blockNumber: string | 'latest' = 'latest'): Promise<string> {
    return this.rpcCall<string>('eth_getBalance', [address, blockNumber]);
  }

  /**
   * Получает количество транзакций (nonce) для аккаунта
   */
  async getTransactionCount(address: string, blockNumber: string | 'latest' = 'latest'): Promise<string> {
    return this.rpcCall<string>('eth_getTransactionCount', [address, blockNumber]);
  }

  /**
   * Отправляет транзакцию в Besu
   * Внимание: для реальной отправки нужна подпись транзакции
   */
  async sendTransaction(tx: BesuTransaction): Promise<string> {
    const txData: any = {
      to: tx.to,
    };

    if (tx.from) txData.from = tx.from;
    if (tx.value) txData.value = tx.value || '0x0';
    if (tx.data) txData.data = tx.data || '0x';
    if (tx.gas) txData.gas = tx.gas;
    if (tx.gasPrice) txData.gasPrice = tx.gasPrice;
    if (tx.nonce) txData.nonce = tx.nonce;

    return this.rpcCall<string>('eth_sendTransaction', [txData]);
  }

  /**
   * Оценивает газ для транзакции
   */
  async estimateGas(tx: BesuTransaction): Promise<string> {
    const txData: any = {
      to: tx.to,
    };

    if (tx.from) txData.from = tx.from;
    if (tx.value) txData.value = tx.value || '0x0';
    if (tx.data) txData.data = tx.data || '0x';

    return this.rpcCall<string>('eth_estimateGas', [txData]);
  }

  /**
   * Получает информацию о сети
   */
  async getNetworkInfo() {
    const [chainId, blockNumber, gasPrice] = await Promise.all([
      this.rpcCall<string>('eth_chainId'),
      this.getBlockNumber(),
      this.rpcCall<string>('eth_gasPrice'),
    ]);

    return {
      chainId: parseInt(chainId, 16),
      blockNumber: parseInt(blockNumber, 16),
      gasPrice: parseInt(gasPrice, 16),
    };
  }

  /**
   * Проверяет доступность Besu RPC
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }
}

