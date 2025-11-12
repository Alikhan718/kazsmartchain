import { Controller, Get, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry } from 'prom-client';

@Controller('/metrics')
export class MetricsController {
  constructor(@Inject('PROM_REGISTRY') private readonly registry: Registry) {}

  @Get()
  async metrics(@Res() res: Response) {
    res.setHeader('Content-Type', this.registry.contentType);
    res.send(await this.registry.metrics());
  }
}

