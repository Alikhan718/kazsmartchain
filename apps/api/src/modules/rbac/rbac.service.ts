import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.service';

@Injectable()
export class RbacService {
  hasRole(user: AuthUser | null, role: string): boolean {
    if (!user) return false;
    if (user.roles.includes('SuperAdmin')) return true;
    return user.roles.includes(role);
  }
}

