import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../rbac/tenant.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';

@Controller('/api/solana')
export class SolanaController {
  constructor(private readonly solana: SolanaService) {}

  @Post(':orgId/mint')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  mint(
    @Param('orgId') orgId: string,
    @Body() body: { uri: string; besuTxHash?: string; signerPolicy?: 'custodial' | 'user'; userWallet?: string },
  ) {
    return this.solana.mint({
      organizationId: orgId,
      uri: body.uri,
      besuTxHash: body.besuTxHash,
      signerPolicy: body.signerPolicy || 'custodial',
      userWallet: body.userWallet,
    });
  }

  @Post(':orgId/update')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin')
  update(@Param('orgId') orgId: string, @Body() body: { mint: string; uri: string; besuTxHash?: string }) {
    return this.solana.updateMetadata({ organizationId: orgId, mint: body.mint, uri: body.uri, besuTxHash: body.besuTxHash });
  }

  @Post(':orgId/revoke')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin')
  revoke(@Param('orgId') orgId: string, @Body() body: { mint: string; besuTxHash?: string }) {
    return this.solana.revoke({ organizationId: orgId, mint: body.mint, besuTxHash: body.besuTxHash });
  }

  @Get('/metadata/:mint')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor', 'Operator')
  metadata(@Param('mint') mint: string) {
    return this.solana.getMetadata(mint);
  }
}

