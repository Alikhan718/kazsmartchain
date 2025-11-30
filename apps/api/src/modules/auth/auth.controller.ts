import { Controller, Get, Post, Body, Headers, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginRequest } from './auth.service';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('/api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly auth: AuthService) {}

  @Post('/challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate challenge for ECDSA login' })
  @ApiResponse({ status: 200, description: 'Challenge generated successfully' })
  async generateChallenge(@Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    
    const result = await this.auth.generateChallenge(ipAddress, userAgent);
    
    return {
      ...result,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with ECDSA signature' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature or challenge' })
  async login(
    @Body() body: LoginRequest,
    @Req() req: Request,
  ) {
    // Логируем что получили
    this.logger.debug(`Received login request: cert length=${body.certificate?.length || 0}`);
    this.logger.debug(`Certificate preview: ${body.certificate?.substring(0, 200)}`);
    this.logger.debug(`Certificate end: ${body.certificate?.substring(Math.max(0, (body.certificate?.length || 0) - 100))}`);
    this.logger.debug(`Full certificate: ${body.certificate}`);
    
    // Проверяем raw body если доступен
    if ((req as any).rawBody) {
      this.logger.debug(`Raw body length: ${(req as any).rawBody.length}`);
    }
    
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    
    return await this.auth.loginWithECDSA(body, ipAddress, userAgent);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.auth.refreshAccessToken(body.refreshToken);
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info' })
  me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    const user = this.auth.verifyBearer(token);
    return { authenticated: !!user, user };
  }
}

