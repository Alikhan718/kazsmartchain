import { Controller, Get, Post, Body, Headers, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('/api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly auth: AuthService) {}

  @Post('/biometric/session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create biometric verification session' })
  @ApiResponse({ status: 200, description: 'Session created successfully' })
  async createBiometricSession() {
    this.logger.log('Creating biometric session...');
    return await this.auth.createBiometricSession();
  }

  @Post('/biometric/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify biometric session and login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Verification failed' })
  async verifyBiometricSession(
    @Body() body: { sessionId: string },
    @Req() req: Request,
  ) {
    this.logger.log(`Verifying biometric session: ${body.sessionId}`);
    
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    
    return await this.auth.loginWithBiometric(body.sessionId, ipAddress, userAgent);
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
