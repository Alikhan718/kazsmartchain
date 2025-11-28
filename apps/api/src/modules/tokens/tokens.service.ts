import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ethers } from 'ethers';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly besuUrl = process.env.BESU_RPC_URL || 'http://besu:8545';
  private readonly fireflyUrl = process.env.FIREFLY_BASE_URL || 'http://firefly:5000';
  private readonly kscTokenAddress = '0x42699A7612A82f1d9C36148af9C77354759b210b';
  private readonly kscPoolId = '76805036-2550-4615-9853-4ac2ad43bab3';

  // Organization addresses
  private readonly organizations: Record<
    string,
    { name: string; address: string; slug: string }
  > = {
    bcc: {
      name: 'Банк ЦентрКредит (BCC)',
      address: '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
      slug: 'bcc',
    },
    kaznu: {
      name: 'КазНУ имени Аль-Фараби',
      address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', // Изменено на Besu dev account #2
      slug: 'kaznu',
    },
  };

  /**
   * Get KSC token balances for all organizations
   */
  async getKSCBalances() {
    try {
      // ERC-20 function signatures
      const balanceOfSignature = '0x70a08231'; // balanceOf(address)
      const totalSupplySignature = '0x18160ddd'; // totalSupply()

      // Helper to call contract
      const callContract = async (data: string) => {
        const response = await axios.post(this.besuUrl, {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: this.kscTokenAddress,
              data: data,
            },
            'latest',
          ],
          id: 1,
        });
        return response.data.result;
      };

      // Get total supply
      const totalSupplyHex = await callContract(totalSupplySignature);
      const totalSupply = parseInt(totalSupplyHex, 16) / 1e18;

      // Get balances for each organization
      const balances = await Promise.all(
        Object.entries(this.organizations).map(async ([key, org]) => {
          const data =
            balanceOfSignature +
            org.address.slice(2).toLowerCase().padStart(64, '0');
          const balanceHex = await callContract(data);
          const balance = parseInt(balanceHex, 16) / 1e18;

          return {
            organization: org.name,
            slug: org.slug,
            address: org.address,
            balance: balance.toFixed(2),
            balanceRaw: balance,
          };
        }),
      );

      return {
        token: {
          address: this.kscTokenAddress,
          symbol: 'KSC',
          name: 'KazSmartChain Token',
          decimals: 18,
        },
        totalSupply: totalSupply.toFixed(2),
        totalSupplyRaw: totalSupply,
        balances: balances,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get KSC balances', error);
      throw error;
    }
  }

  /**
   * Get KSC token transaction history directly from blockchain Transfer events
   */
  async getKSCTransactions(limit: number = 50, offset: number = 0) {
    try {
      // Create provider
      const provider = new ethers.JsonRpcProvider(this.besuUrl);
      
      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      
      // Scan from block 1 to get ALL transactions (for small chains this is fine)
      // We'll scan in chunks to stay within Besu's eth_getLogs limits
      const startBlock = 1;
      const chunkSize = 1000;
      
      // ERC-20 Transfer event signature: Transfer(address,address,uint256)
      const transferEventSignature = ethers.id('Transfer(address,address,uint256)');
      
      // Get Transfer event logs from blockchain (scan in chunks)
      let allLogs: any[] = [];
      for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
        const toBlock = Math.min(fromBlock + chunkSize - 1, currentBlock);
        
        try {
          const logs = await provider.getLogs({
            address: this.kscTokenAddress,
            topics: [transferEventSignature],
            fromBlock: fromBlock,
            toBlock: toBlock,
          });
          allLogs = allLogs.concat(logs);
        } catch (err) {
          // If chunk is too large, try smaller chunks
          this.logger.warn(`Failed to get logs for block range ${fromBlock}-${toBlock}, skipping`);
        }
      }
      
      this.logger.log(`Found ${allLogs.length} Transfer events from block ${startBlock} to ${currentBlock}`);
      
      const logs = allLogs;

      // Parse logs into transactions
      const transactions = await Promise.all(
        logs.reverse().map(async (log) => {
          // Decode the log data
          const from = '0x' + log.topics[1].slice(26);
          const to = '0x' + log.topics[2].slice(26);
          const value = BigInt(log.data);
          const amount = Number(value) / 1e18;
          
          // Get block timestamp
          let blockTime: Date;
          try {
            const block = await provider.getBlock(log.blockNumber);
            blockTime = block ? new Date(Number(block.timestamp) * 1000) : new Date();
          } catch {
            blockTime = new Date();
          }
          
          // Determine transaction type
          let type = 'transfer';
          if (from === '0x0000000000000000000000000000000000000000') {
            type = 'mint';
          } else if (to === '0x0000000000000000000000000000000000000000') {
            type = 'burn';
          }
          
          // Find organization names
          const fromOrg = Object.values(this.organizations).find(
            (org) => org.address.toLowerCase() === from.toLowerCase(),
          );
          const toOrg = Object.values(this.organizations).find(
            (org) => org.address.toLowerCase() === to.toLowerCase(),
          );

          return {
            id: log.transactionHash,
            type: type,
            from: type === 'mint' ? 'Contract' : from,
            fromName: type === 'mint' ? 'Contract' : (fromOrg?.name || from),
            to: type === 'burn' ? 'Contract' : to,
            toName: type === 'burn' ? 'Contract' : (toOrg?.name || to),
            value: amount.toFixed(4),
            valueRaw: amount,
            symbol: 'KSC',
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            created: blockTime.toISOString(),
          };
        }),
      );

      // Apply pagination
      const paginatedTx = transactions.slice(offset, offset + limit);

      return {
        transactions: paginatedTx,
        total: transactions.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < transactions.length,
      };
    } catch (error) {
      this.logger.error('Failed to get KSC transactions from blockchain', error);
      
      // Fallback to FireFly if blockchain query fails
      return this.getKSCTransactionsFromFireFly(limit, offset);
    }
  }
  
  /**
   * Fallback: Get transactions from FireFly
   */
  private async getKSCTransactionsFromFireFly(limit: number, offset: number) {
    try {
      const response = await axios.get(
        `${this.fireflyUrl}/api/v1/namespaces/default/tokens/transfers`,
        {
          params: { limit: 100 },
          timeout: 5000,
        },
      );

      const allTransfers = response.data || [];
      const kscTransfers = allTransfers.filter(
        (transfer: any) => transfer.pool === this.kscPoolId,
      );

      const transactions = kscTransfers
        .slice(offset, offset + limit)
        .map((transfer: any) => {
          const amount = transfer.amount
            ? (parseInt(transfer.amount) / 1e18).toFixed(4)
            : '0';

          const fromOrg = Object.values(this.organizations).find(
            (org) =>
              transfer.from &&
              org.address.toLowerCase() === transfer.from.toLowerCase(),
          );
          const toOrg = Object.values(this.organizations).find(
            (org) =>
              transfer.to &&
              org.address.toLowerCase() === transfer.to.toLowerCase(),
          );

          return {
            id: transfer.localId,
            type: transfer.type,
            from: transfer.from || 'Contract',
            fromName: fromOrg?.name || transfer.from || 'Contract',
            to: transfer.to || 'Contract',
            toName: toOrg?.name || transfer.to || 'Contract',
            value: amount,
            valueRaw: transfer.amount ? parseInt(transfer.amount) / 1e18 : 0,
            symbol: 'KSC',
            created: transfer.created,
          };
        });

      return {
        transactions: transactions,
        total: kscTransfers.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < kscTransfers.length,
      };
    } catch (error) {
      this.logger.error('Failed to get KSC transactions from FireFly', error);
      return {
        transactions: [],
        total: 0,
        limit: limit,
        offset: offset,
        hasMore: false,
      };
    }
  }

  /**
   * Get KSC token statistics
   */
  async getKSCStats() {
    try {
      const [balancesData, transactionsData] = await Promise.all([
        this.getKSCBalances(),
        this.getKSCTransactions(1000, 0), // Get all for stats
      ]);

      const transactions = transactionsData.transactions;

      // Calculate stats
      const totalMinted = transactions
        .filter((tx: any) => tx.type === 'mint')
        .reduce((sum: number, tx: any) => sum + tx.valueRaw, 0);

      const totalBurned = transactions
        .filter((tx: any) => tx.type === 'burn')
        .reduce((sum: number, tx: any) => sum + tx.valueRaw, 0);

      const totalTransferred = transactions
        .filter((tx: any) => tx.type === 'transfer')
        .reduce((sum: number, tx: any) => sum + tx.valueRaw, 0);

      return {
        totalSupply: balancesData.totalSupply,
        totalMinted: totalMinted.toFixed(2),
        totalBurned: totalBurned.toFixed(2),
        totalTransferred: totalTransferred.toFixed(2),
        totalTransactions: transactions.length,
        mintCount: transactions.filter((tx: any) => tx.type === 'mint').length,
        burnCount: transactions.filter((tx: any) => tx.type === 'burn').length,
        transferCount: transactions.filter((tx: any) => tx.type === 'transfer')
          .length,
        holders: balancesData.balances.filter(
          (b: any) => parseFloat(b.balance) > 0,
        ).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get KSC stats', error);
      throw error;
    }
  }

  /**
   * Ensure token pool is registered and return poolLocator for FireFly transfers
   */
  private async ensureTokenPool(): Promise<string> {
    try {
      // Check if pool exists via FireFly
      const poolsResponse = await axios.get(
        `${this.fireflyUrl}/api/v1/namespaces/default/tokens/pools`,
        { timeout: 5000 },
      );

      const pools = poolsResponse.data?.value || poolsResponse.data || [];
      const existingPool = pools.find(
        (p: any) =>
          (p.config?.address?.toLowerCase() ===
            this.kscTokenAddress.toLowerCase()) ||
          (p.info?.address?.toLowerCase() ===
            this.kscTokenAddress.toLowerCase()),
      );

      if (existingPool) {
        this.logger.log(`Using existing pool: ${existingPool.id}`);
        // Return pool ID (UUID) for FireFly API
        return existingPool.id;
      }

      // Create pool via FireFly API (proper way according to FireFly docs)
      this.logger.log('Registering KSC token pool via FireFly API...');
      const ownerAddress = '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73';
      
      try {
        const poolResponse = await axios.post(
          `${this.fireflyUrl}/api/v1/namespaces/default/tokens/pools`,
          {
            name: 'KSC-Token',
            type: 'fungible',
            symbol: 'KSC',
            config: {
              address: this.kscTokenAddress,
              blockNumber: '0',
            },
            key: ownerAddress, // Signing key
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
          },
        );

        this.logger.log(`Token pool created via FireFly API: ${poolResponse.data.id}`);
        
        // Wait a bit for pool to be fully registered
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        return poolResponse.data.id;
      } catch (fireflyError: any) {
        // If FireFly API fails, try fftokens as fallback
        if (fireflyError.response?.status === 400 || fireflyError.response?.data?.error?.includes('FF10414')) {
          this.logger.warn('FireFly API pool creation not supported, trying fftokens API...');
          
          const fftokensUrl = process.env.FFTOKENS_URL || 'http://fftokens:3000';
          try {
            const poolResponse = await axios.post(
              `${fftokensUrl}/api/v1/createpool`,
              {
                namespace: 'default',
                name: 'KSC-Token',
                type: 'fungible',
                signer: ownerAddress,
                config: {
                  address: this.kscTokenAddress,
                },
              },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
              },
            );

            this.logger.log(`Token pool created via fftokens: ${poolResponse.data.poolLocator || 'success'}`);
            
            // Wait for FireFly to sync (fftokens sends events to FireFly)
            await new Promise((resolve) => setTimeout(resolve, 5000));
            
            // Check if pool appeared in FireFly
            const updatedPools = await axios.get(
              `${this.fireflyUrl}/api/v1/namespaces/default/tokens/pools`,
              { timeout: 10000 },
            );
            
            const newPool = (updatedPools.data?.value || updatedPools.data || []).find(
              (p: any) =>
                p.config?.address?.toLowerCase() ===
                this.kscTokenAddress.toLowerCase(),
            );
            
            if (newPool) {
              this.logger.log(`Pool synced to FireFly: ${newPool.id}`);
              return newPool.id;
            }
          } catch (fftokensError: any) {
            this.logger.warn(
              `fftokens API also failed: ${fftokensError.response?.data?.message || fftokensError.message}`,
            );
          }
        } else {
          this.logger.error(`FireFly API pool creation failed: ${fireflyError.response?.data?.error || fireflyError.message}`);
        }
      }

      // Fallback: use hardcoded pool ID if available
      this.logger.warn('Pool not found in FireFly, using fallback pool ID');
      return this.kscPoolId;
    } catch (error: any) {
      this.logger.error('Failed to ensure token pool', error);
      // Fallback: use hardcoded pool ID
      this.logger.warn(`Using hardcoded pool ID as fallback: ${this.kscPoolId}`);
      return this.kscPoolId;
    }
  }

  /**
   * Transfer KSC tokens between organizations via FireFly API
   * FireFly uses firefly-signer for transaction signing
   */
  async transferKSC(fromOrg: string, toOrg: string, amount: number) {
    try {
      // Validate organizations
      if (!this.organizations[fromOrg] || !this.organizations[toOrg]) {
        throw new Error(`Invalid organization. Use 'bcc' or 'kaznu'`);
      }

      if (fromOrg === toOrg) {
        throw new Error('Cannot transfer to the same organization');
      }

      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const fromAddress = this.organizations[fromOrg].address;
      const toAddress = this.organizations[toOrg].address;

      // Check balance first
      const balancesData = await this.getKSCBalances();
      const fromBalance = balancesData.balances.find(
        (b: any) => b.slug === fromOrg,
      );

      if (!fromBalance || parseFloat(fromBalance.balance) < amount) {
        throw new Error(
          `Insufficient balance. ${this.organizations[fromOrg].name} has ${fromBalance?.balance || 0} KSC`,
        );
      }

      // Execute transfer via FireFly
      this.logger.log(
        `Transferring ${amount} KSC from ${fromOrg} to ${toOrg} via FireFly`,
      );

      const result = await this.executeFireFlyTransfer(
        fromAddress,
        toAddress,
        amount,
      );
      
      this.logger.log(`FireFly transfer completed! LocalID: ${result.localId}, TX: ${result.tx?.id}`);

      return {
        success: true,
        transferId: result.localId,
        txHash: result.tx?.id || result.localId,
        from: {
          org: fromOrg,
          name: this.organizations[fromOrg].name,
          address: fromAddress,
        },
        to: {
          org: toOrg,
          name: this.organizations[toOrg].name,
          address: toAddress,
        },
        amount: amount,
        timestamp: new Date().toISOString(),
        method: 'firefly',
      };
    } catch (error: any) {
      this.logger.error('Failed to transfer KSC tokens via FireFly', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Transfer failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Execute transfer via FireFly API (which uses firefly-signer)
   */
  private async executeFireFlyTransfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<any> {
    // Convert amount to wei string (18 decimals)
    const amountWei = (BigInt(Math.floor(amount * 1e18))).toString();

    // FireFly token transfer - use 'key' as signer, 'to' as recipient
    // Don't include 'from' - FireFly uses 'key' for that
    const transferPayload = {
      pool: this.kscPoolId,
      to: toAddress,
      amount: amountWei,
      key: fromAddress, // Signing key (firefly-signer has the private key)
    };

    this.logger.log(`Sending FireFly transfer: ${amount} KSC from ${fromAddress} (key) to ${toAddress}`);

    const response = await axios.post(
      `${this.fireflyUrl}/api/v1/namespaces/default/tokens/transfers`,
      transferPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // 60 seconds for blockchain confirmation
      },
    );

    return response.data;
  }

}

