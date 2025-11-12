import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CertsService } from './certs.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../rbac/tenant.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';

@Controller('/api/certs')
export class CertsController {
  constructor(private readonly certs: CertsService) {}

  @Post(':orgId/upload')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin')
  upload(@Param('orgId') orgId: string, @Body() body: { pem: string }) {
    return this.certs.upload(orgId, body.pem);
  }

  @Get(':orgId')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor')
  list(@Param('orgId') orgId: string) {
    return this.certs.list(orgId);
  }

  @Post(':orgId/:certId/toggle')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin')
  toggleActive(@Param('orgId') orgId: string, @Param('certId') certId: string) {
    return this.certs.toggleActive(orgId, certId);
  }
}

