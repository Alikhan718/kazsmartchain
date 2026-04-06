import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SOCIAL_MEALS_SESSION_COOKIE } from './lib/social-meals/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/social-meals')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SOCIAL_MEALS_SESSION_COOKIE)?.value;
  const isLoginPage = pathname === '/social-meals/login';

  if (!sessionCookie && !isLoginPage) {
    const loginUrl = new URL('/social-meals/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/social-meals', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/social-meals/:path*'],
};
