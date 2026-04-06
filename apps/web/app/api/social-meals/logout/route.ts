import { NextResponse } from 'next/server';

import { SOCIAL_MEALS_SESSION_COOKIE } from '../../../../lib/social-meals/constants';
import {
  getSocialMealsSessionCookieOptions,
} from '../../../../lib/social-meals/session';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SOCIAL_MEALS_SESSION_COOKIE, '', {
    ...getSocialMealsSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
