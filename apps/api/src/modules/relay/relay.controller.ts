import { Controller, Get } from '@nestjs/common';

@Controller('/api/relay')
export class RelayController {
  @Get('/health')
  health() {
    return { status: 'ok' };
  }
}

