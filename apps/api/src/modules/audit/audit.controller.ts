import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';
import { OrgsService } from '../orgs/orgs.service';

@Controller('/api/audit')
export class AuditController {
  constructor(
    private readonly audit: AuditService,
    private readonly auth: AuthService,
    private readonly orgs: OrgsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor')
  async list(
    @Headers('authorization') authHeader?: string,
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const user = this.auth.verifyBearer(token);
    let scopeTenant = user?.roles.includes('SuperAdmin') ? tenantId ?? undefined : user?.tenantId;
    if (scopeTenant) {
      try {
        const org = await this.orgs.resolve(scopeTenant);
        scopeTenant = org.id;
      } catch (err) {
        // Если организация не найдена, логируем но продолжаем (может быть пустая база)
        console.warn(`Organization not found for tenant: ${scopeTenant}`, err);
        // Оставляем scopeTenant как есть (slug), чтобы попробовать найти по slug напрямую
        // Но в базе ищется по organizationId (UUID), поэтому если не нашли, scopeTenant останется undefined
        scopeTenant = undefined;
      }
    }
    const events = await this.audit.search({ tenantId: scopeTenant, userId, type });
    return { events };
  }
}

