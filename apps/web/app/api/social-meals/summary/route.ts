import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getSocialMealsSummary } from '../../../../lib/social-meals/jasaim';
import { isIsoDate } from '../../../../lib/social-meals/date';
import { getSocialMealsSession } from '../../../../lib/social-meals/session';

export async function GET(request: NextRequest) {
  const session = getSocialMealsSession(await cookies());

  if (!session) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get('date') ?? '';

  if (!isIsoDate(date)) {
    return NextResponse.json({ message: 'Некорректная дата' }, { status: 400 });
  }

  try {
    const summary = await getSocialMealsSummary(date);
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось загрузить сводку по соцпитанию';

    return NextResponse.json({ message }, { status: 502 });
  }
}
