export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
export const RELAY_BASE = process.env.NEXT_PUBLIC_RELAY_BASE_URL || 'http://localhost:4100';
export const EDIPLOMA_API_URL = process.env.NEXT_PUBLIC_EDIPLOMA_API_URL || 'http://localhost:8081';

// Генерирует токен для указанного тенанта
export function getDevToken(tenantId: string = 'demo-bank'): string {
  return `dev:${tenantId}:OrgAdmin`;
}


