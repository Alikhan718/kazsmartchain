import { Injectable } from '@nestjs/common';

export type AuthUser = {
  userId: string;
  tenantId: string;
  roles: string[];
  email: string;
};

@Injectable()
export class AuthService {
  // DEV: stub verification, replace with OIDC/SAML integration
  verifyBearer(token?: string): AuthUser | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString('utf8'));
      return payload as AuthUser;
    } catch {
      // accept "dev:{tenantId}:{role}" tokens in dev for quick testing
      if (token.startsWith('dev:')) {
        const [, tenantId, role = 'OrgAdmin'] = token.split(':');
        return {
          userId: 'dev-user',
          tenantId,
          roles: [role],
          email: 'dev@example.com',
        };
      }
      return null;
    }
  }
}

