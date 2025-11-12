import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    const token = header?.replace('Bearer ', '');
    const user = this.auth.verifyBearer(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or missing bearer token');
    }
    (req as any).user = user;
    return true;
  }
}

