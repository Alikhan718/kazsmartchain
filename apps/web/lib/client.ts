import { KazClient } from '@kazsmartchain/sdk';
import { API_BASE, getDevToken } from './env';

export function createClient(tokenOrTenantId?: string) {
  // Если передан токен напрямую - используем его
  // Если передан tenantId (начинается с 'dev:' или это orgId) - генерируем токен
  // Иначе используем дефолтный токен для demo-bank
  let token: string;
  if (!tokenOrTenantId) {
    token = getDevToken('demo-bank');
  } else if (tokenOrTenantId.startsWith('dev:')) {
    token = tokenOrTenantId;
  } else {
    // Предполагаем, что это tenantId/orgId
    token = getDevToken(tokenOrTenantId);
  }
  return new KazClient(API_BASE, token);
}


