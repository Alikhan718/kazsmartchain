import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { collectDefaultMetrics, Registry } from 'prom-client';

const registry = new Registry();
collectDefaultMetrics({ register: registry });

@Module({
  providers: [{ provide: 'PROM_REGISTRY', useValue: registry }],
  controllers: [MetricsController],
  exports: ['PROM_REGISTRY'],
})
export class MetricsModule {}

