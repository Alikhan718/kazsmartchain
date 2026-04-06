import { timingSafeEqual } from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { getSocialMealsConfig } from '../../../../lib/social-meals/config';
import { SOCIAL_MEALS_SESSION_COOKIE } from '../../../../lib/social-meals/constants';
import {
  createSocialMealsSession,
  getSocialMealsSessionCookieOptions,
} from '../../../../lib/social-meals/session';

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = body?.username?.trim() ?? '';
  const password = body?.password ?? '';
  const config = getSocialMealsConfig();

  if (
    !safeEquals(username, config.adminUsername) ||
    !safeEquals(password, config.adminPassword)
  ) {
    return NextResponse.json(
      { message: 'Неверный логин или пароль' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const session = createSocialMealsSession(config.adminUsername);

  response.cookies.set(
    SOCIAL_MEALS_SESSION_COOKIE,
    session,
    getSocialMealsSessionCookieOptions(),
  );

  return response;
}
