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

  async postPrivateTx(body: any, base?: string, ns?: string) {
    const res = await this.clientFor(base).post(`/api/v1/namespaces/${ns || this.defaultNs}/transactions/private`, body);
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

