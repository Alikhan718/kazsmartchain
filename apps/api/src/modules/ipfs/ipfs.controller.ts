import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { TenantGuard } from '../rbac/tenant.guard';
import { Roles } from '../rbac/roles.decorator';

@Controller('/api/ipfs')
export class IpfsController {
  constructor(private readonly ipfs: IpfsService) {}

  @Post(':orgId/upload')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  async upload(@Param('orgId') orgId: string, @Body() body: { filename: string; mime: string; base64: string }) {
    const buffer = Buffer.from(body.base64, 'base64');
    return this.ipfs.upload(orgId, buffer, body.filename, body.mime);
  }

  @Get(':orgId')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor', 'Operator')
  list(@Param('orgId') orgId: string) {
    return this.ipfs.list(orgId);
  }

  @Post('/pin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  pin(@Body() body: { cid: string }) {
    return this.ipfs.pin(body.cid);
  }
}

