import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSocialMealsSession } from './session';

export async function requireSocialMealsAuth() {
  const session = getSocialMealsSession(await cookies());

  if (!session) {
    redirect('/social-meals/login');
  }

  return session;
}

export async function getOptionalSocialMealsSession() {
  return getSocialMealsSession(await cookies());
}
