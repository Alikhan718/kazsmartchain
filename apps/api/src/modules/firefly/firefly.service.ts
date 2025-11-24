import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class FireFlyService {
  private defaultBase = process.env.FIREFLY_BASE_URL || 'http://localhost:5100';
  private defaultNs = process.env.FIREFLY_NAMESPACE || 'default';
  private clientFor(base?: string): AxiosInstance {
    return axios.create({ baseURL: base || this.defaultBase, timeout: 10_000 });
  }

  async listNamespaces(base?: string) {
    const res = await this.clientFor(base).get('/namespaces');
    return res.data;
  }

  /**
   * Отправляет приватную транзакцию через FireFly
   * Формат body должен соответствовать FireFly API:
   * {
   *   "to": "0x...", // адрес получателя (опционально для контрактов)
   *   "data": "0x...", // данные транзакции (hex)
   *   "value": "0x0", // значение в wei (опционально)
   *   "group": {...} // группа приватности (опционально)
   * }
   */
  async postPrivateTx(body: any, base?: string, ns?: string) {
    // Нормализуем формат данных для FireFly
    const normalizedBody: any = {};
    
    if (body.to) {
      normalizedBody.to = body.to.startsWith('0x') ? body.to : `0x${body.to}`;
    }
    
    if (body.data) {
      normalizedBody.data = body.data.startsWith('0x') ? body.data : `0x${body.data}`;
    } else {
      normalizedBody.data = '0x';
    }
    
    if (body.value) {
      normalizedBody.value = typeof body.value === 'string' 
        ? (body.value.startsWith('0x') ? body.value : `0x${parseInt(body.value, 10).toString(16)}`)
        : `0x${body.value.toString(16)}`;
    }
    
    // Группа приватности (если указана)
    if (body.privacyGroupId || body.group) {
      normalizedBody.group = body.group || { members: [body.privacyGroupId] };
    }
    
    const res = await this.clientFor(base).post(
      `/api/v1/namespaces/${ns || this.defaultNs}/transactions/private`,
      normalizedBody
    );
    return res.data;
  }

  async registerContractInterface(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/contracts/interfaces`, body);
    return res.data;
  }

  async createEventStream(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/events/streams`, body);
    return res.data;
  }

  // Tokens (ERC-1155) via FireFly
  async tokensCreatePool(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/tokens/pools`, body);
    return res.data;
  }
  async tokensMint(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/tokens/mint`, body);
    return res.data;
  }
  async tokensTransfer(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/tokens/transfer`, body);
    return res.data;
  }
  async tokensBurn(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/tokens/burn`, body);
    return res.data;
  }
}

