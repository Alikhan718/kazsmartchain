import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RbacService } from './rbac.service';

@Controller('/api/rbac')
export class RbacController {
  constructor(private readonly auth: AuthService, private readonly rbac: RbacService) {}

  @Get('/check')
  check(@Headers('authorization') authHeader?: string, @Query('role') role?: string) {
    const token = authHeader?.replace('Bearer ', '');
    const user = this.auth.verifyBearer(token);
    const ok = !!role && this.rbac.hasRole(user, role);
    return { ok, user, role };
  }
}

