import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = (req as any).user as { tenantId: string; roles: string[] } | undefined;
    if (!user) return false;
    // SuperAdmin can access any tenant
    if (user.roles?.includes('SuperAdmin')) return true;
    const orgParam = (req.params?.orgId as string) || (req.params?.tenantId as string);
    if (!orgParam) return true; // no tenant scope required
    if (orgParam !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    return true;
  }
}

