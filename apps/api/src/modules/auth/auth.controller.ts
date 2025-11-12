import { Controller, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('/me')
  me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    const user = this.auth.verifyBearer(token);
    return { authenticated: !!user, user };
  }
}

