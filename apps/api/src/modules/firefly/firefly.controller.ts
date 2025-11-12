import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FireFlyService } from './firefly.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';
import { TenantGuard } from '../rbac/tenant.guard';
import { AuditService } from '../audit/audit.service';
import { OrgsService } from '../orgs/orgs.service';

@Controller('/api/besu/firefly')
export class FireFlyController {
  constructor(
    private readonly ff: FireFlyService,
    private readonly audit: AuditService,
    private readonly orgs: OrgsService,
  ) {}

  @Get('/namespaces')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator', 'Auditor')
  namespaces() {
    return this.ff.listNamespaces();
  }

  @Post('/:orgId/tx/private')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  privateTx(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.postPrivateTx(body, org.fireflyBaseUrl, 'default').then(async (res) => {
      const org = await this.orgs.resolve(orgId);
      await this.audit.log({ organization: { id: org.id } as any, eventType: 'besu.privateTx', details: res });
      return res;
    }));
  }

  @Post('/:orgId/contracts/interfaces')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  registerInterface(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.registerContractInterface(body, org.fireflyBaseUrl, 'default'));
  }

  @Post('/:orgId/events/streams')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  createStream(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.createEventStream(body, org.fireflyBaseUrl, 'default'));
  }

  // Tokens (ERC-1155)
  @Post('/:orgId/tokens/pools')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  createPool(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.tokensCreatePool(body, org.fireflyBaseUrl, 'default').then(async (res) => {
      await this.audit.log({ organization: { id: org.id } as any, eventType: 'tokens.pool', details: res });
      return res;
    }));
  }

  @Post('/:orgId/tokens/mint')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  tokensMint(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.tokensMint(body, org.fireflyBaseUrl, 'default').then(async (res) => {
      await this.audit.log({ organization: { id: org.id } as any, eventType: 'tokens.mint', details: res });
      return res;
    }));
  }

  @Post('/:orgId/tokens/transfer')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  tokensTransfer(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.tokensTransfer(body, org.fireflyBaseUrl, 'default').then(async (res) => {
      await this.audit.log({ organization: { id: org.id } as any, eventType: 'tokens.transfer', details: res });
      return res;
    }));
  }

  @Post('/:orgId/tokens/burn')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  tokensBurn(@Param('orgId') orgId: string, @Body() body: any) {
    return this.orgs.resolve(orgId).then((org) => this.ff.tokensBurn(body, org.fireflyBaseUrl, 'default').then(async (res) => {
      await this.audit.log({ organization: { id: org.id } as any, eventType: 'tokens.burn', details: res });
      return res;
    }));
  }
}

