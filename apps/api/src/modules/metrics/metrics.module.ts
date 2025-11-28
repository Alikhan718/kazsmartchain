import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { DashboardController } from './dashboard.controller';
import { TestDataController } from './test-data.controller';
import { MetricsService } from './metrics.service';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { AuditEvent } from '../../persistence/entities/audit-event.entity';
import { Organization } from '../../persistence/entities/organization.entity';

const registry = new Registry();
collectDefaultMetrics({ register: registry });

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent, Organization])],
  providers: [
    { provide: 'PROM_REGISTRY', useValue: registry },
    MetricsService,
  ],
  controllers: [MetricsController, DashboardController, TestDataController],
  exports: ['PROM_REGISTRY', MetricsService],
})
export class MetricsModule {}

