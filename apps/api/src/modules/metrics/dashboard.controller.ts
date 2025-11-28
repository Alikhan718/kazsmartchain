import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { TenantGuard } from '../rbac/tenant.guard';

@ApiTags('Dashboard Metrics')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Global network metrics (for Superadmin)
   */
  @Get('network')
  @ApiOperation({ summary: 'Get global network metrics (Superadmin)' })
  async getNetworkMetrics() {
    return this.metricsService.getNetworkMetrics();
  }

  /**
   * Organization-specific metrics
   */
  @Get('org/:orgId')
  @UseGuards(TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization metrics' })
  async getOrganizationMetrics(@Param('orgId') orgId: string) {
    return this.metricsService.getOrganizationMetrics(orgId);
  }

  /**
   * Transaction statistics by hour
   */
  @Get('transactions/hourly')
  @ApiOperation({ summary: 'Get transaction stats by hour' })
  async getTransactionsByHour(
    @Query('hours') hours?: number,
    @Query('orgId') orgId?: string,
  ) {
    return this.metricsService.getTransactionsByHour(
      hours ? parseInt(hours.toString()) : 12,
      orgId,
    );
  }

  /**
   * Recent transactions
   */
  @Get('transactions/recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  async getRecentTransactions(
    @Query('limit') limit?: number,
    @Query('orgId') orgId?: string,
  ) {
    return this.metricsService.getRecentTransactions(
      limit ? parseInt(limit.toString()) : 20,
      orgId,
    );
  }

  /**
   * Validators list
   */
  @Get('validators')
  @ApiOperation({ summary: 'Get validators list' })
  async getValidators() {
    return this.metricsService.getValidators();
  }
}

