import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { isIsoDate } from '../../../../lib/social-meals/date';
import { getSocialMealsStudents } from '../../../../lib/social-meals/jasaim';
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
    const students = await getSocialMealsStudents(date);
    return NextResponse.json(students);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось загрузить список студентов';

    return NextResponse.json({ message }, { status: 502 });
  }
}
