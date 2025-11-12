import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './auth.service';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthUser | null => {
  const req = ctx.switchToHttp().getRequest();
  return (req as any).user ?? null;
});

