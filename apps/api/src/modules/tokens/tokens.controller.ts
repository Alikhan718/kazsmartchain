import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { TokensService } from './tokens.service';

@ApiTags('KSC Tokens')
@Controller('api/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('balances')
  @ApiOperation({ summary: 'Get KSC token balances for all organizations' })
  async getBalances() {
    return this.tokensService.getKSCBalances();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get KSC token transaction history' })
  async getTransactions(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.tokensService.getKSCTransactions(
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get KSC token statistics' })
  async getStats() {
    return this.tokensService.getKSCStats();
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer KSC tokens between organizations' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fromOrg: { type: 'string', example: 'bcc' },
        toOrg: { type: 'string', example: 'kaznu' },
        amount: { type: 'number', example: 1000 },
      },
      required: ['fromOrg', 'toOrg', 'amount'],
    },
  })
  async transfer(@Body() body: { fromOrg: string; toOrg: string; amount: number }) {
    return this.tokensService.transferKSC(body.fromOrg, body.toOrg, body.amount);
  }
}

