import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RbacService } from './rbac.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly rbac: RbacService) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles || roles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = (req as any).user;
    const ok = roles.some((r) => this.rbac.hasRole(user, r));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}

