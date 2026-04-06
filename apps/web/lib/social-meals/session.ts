import { createHmac, timingSafeEqual } from 'crypto';

import { SOCIAL_MEALS_SESSION_COOKIE } from './constants';
import { getSocialMealsConfig } from './config';

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  username: string;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string): string {
  const { sessionSecret } = getSocialMealsConfig();

  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSocialMealsSession(username: string): string {
  const payload = JSON.stringify({
    username,
    exp: Date.now() + SESSION_TTL_MS,
  } satisfies SessionPayload);
  const encodedPayload = toBase64Url(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySocialMealsSession(session: string | undefined): SessionPayload | null {
  if (!session) {
    return null;
  }

  const [encodedPayload, signature] = session.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!safeEquals(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    const { adminUsername } = getSocialMealsConfig();

    if (payload.username !== adminUsername || payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSocialMealsSession(
  cookieStore: { get(name: string): { value: string } | undefined },
): SessionPayload | null {
  return verifySocialMealsSession(cookieStore.get(SOCIAL_MEALS_SESSION_COOKIE)?.value);
}

export function getSocialMealsSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}
