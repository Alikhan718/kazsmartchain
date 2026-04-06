'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  Loader2,
  LogOut,
  RefreshCcw,
  Search,
  Users,
  X,
} from 'lucide-react';

import type {
  SocialMealsStudent,
  SocialMealsStudentsResponse,
  SocialMealsSummary,
} from '../../lib/social-meals/types';

type SocialMealsDashboardProps = {
  initialDate: string;
  timeZoneLabel: string;
};

const REFRESH_INTERVAL_MS = 30000;

const operationalStats: Array<{ key: keyof SocialMealsSummary; label: string; hint: string }> = [
  { key: 'active_members', label: 'Активные участники', hint: 'Льготники в программе на выбранную дату' },
  { key: 'declarations_submitted', label: 'Подали заявку', hint: 'Отправили декларацию на выбранный день' },
  { key: 'students_planning_to_attend', label: 'Планируют прийти', hint: 'Выбрали хотя бы один прием пищи' },
  { key: 'actual_redemptions', label: 'Фактические выдачи', hint: 'Успешные QR-сканы за день' },
];

const mealPlanStats: Array<{ key: keyof SocialMealsSummary; label: string }> = [
  { key: 'planned_breakfasts', label: 'Завтраки' },
  { key: 'planned_lunches', label: 'Обеды' },
  { key: 'planned_dinners', label: 'Ужины' },
  { key: 'planned_total_meals', label: 'Всего приемов пищи' },
  { key: 'total_possible_meals', label: 'Максимально возможное' },
];

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatTime(value: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Almaty',
  }).format(new Date(value));
}

function formatDateLabel(value: string): string {
  if (!isValidIsoDate(value)) {
    return 'Выберите дату';
  }

  const date = new Date(`${value}T00:00:00+05:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Almaty',
  }).format(date);
}

function BooleanCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <Check className="h-3.5 w-3.5" />
      Да
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      <X className="h-3.5 w-3.5" />
      Нет
    </span>
  );
}

async function loadSummary(date: string): Promise<SocialMealsSummary> {
  const response = await fetch(`/api/social-meals/summary?date=${encodeURIComponent(date)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || 'Не удалось загрузить сводку');
  }

  return response.json();
}

async function loadStudents(date: string): Promise<SocialMealsStudentsResponse> {
  const response = await fetch(`/api/social-meals/students?date=${encodeURIComponent(date)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || 'Не удалось загрузить список студентов');
  }

  return response.json();
}

export function SocialMealsDashboard({
  initialDate,
  timeZoneLabel,
}: SocialMealsDashboardProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [search, setSearch] = useState('');
  const [onlyPlanning, setOnlyPlanning] = useState(false);
  const [onlyWithRedemptions, setOnlyWithRedemptions] = useState(false);
  const [onlyWithMealSelections, setOnlyWithMealSelections] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasValidSelectedDate = isValidIsoDate(selectedDate);

  const summaryQuery = useQuery({
    queryKey: ['social-meals-summary', selectedDate],
    queryFn: () => loadSummary(selectedDate),
    refetchInterval: REFRESH_INTERVAL_MS,
    enabled: hasValidSelectedDate,
  });

  const studentsQuery = useQuery({
    queryKey: ['social-meals-students', selectedDate],
    queryFn: () => loadStudents(selectedDate),
    refetchInterval: REFRESH_INTERVAL_MS,
    enabled: hasValidSelectedDate,
  });

  const students = studentsQuery.data?.students ?? [];
  const summary = summaryQuery.data;
  const normalizedSearch = search.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        student.full_name.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (onlyPlanning && student.planned_meals_count === 0) {
        return false;
      }

      if (onlyWithRedemptions && student.redemptions_count === 0) {
        return false;
      }

      if (
        onlyWithMealSelections &&
        !student.wants_breakfast &&
        !student.wants_lunch &&
        !student.wants_dinner
      ) {
        return false;
      }

      return true;
    });
  }, [
    normalizedSearch,
    onlyPlanning,
    onlyWithMealSelections,
    onlyWithRedemptions,
    students,
  ]);

  const lastUpdatedAt = Math.max(summaryQuery.dataUpdatedAt, studentsQuery.dataUpdatedAt);
  const isRefreshing = summaryQuery.isFetching || studentsQuery.isFetching;

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch('/api/social-meals/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } finally {
      router.push('/social-meals/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  async function handleManualRefresh() {
    await Promise.all([summaryQuery.refetch(), studentsQuery.refetch()]);
  }

  const hasError = summaryQuery.error || studentsQuery.error;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0e1a] dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="glass-strong rounded-3xl border border-gray-200/80 p-6 shadow-xl dark:border-gray-800/70">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                <CalendarDays className="h-3.5 w-3.5" />
                Админ панель социального питания
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Социальное питание</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                  Панель для столовой и фонда NU: план на день, количество приемов пищи и фактические выдачи по QR. Все даты считаются в часовом поясе {timeZoneLabel}.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Выбранная дата
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDateLabel(summary?.meal_date ?? selectedDate)}
                  </div>
                  <div className="mt-1 text-sm text-blue-700/80 dark:text-blue-300/80">
                    {summary?.meal_date ?? selectedDate}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Обновление данных
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <span className={`h-2.5 w-2.5 rounded-full ${isRefreshing ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {isRefreshing ? 'Обновляем...' : 'Данные актуальны'}
                  </div>
                  <div className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                    {lastUpdatedAt ? `Последнее обновление: ${formatTime(lastUpdatedAt)}` : 'Ожидание первого ответа...'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-5 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/60">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-gray-100 p-2.5 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Управление панелью</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Выбор даты и действия с текущей сессией</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Дата</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>

                {!hasValidSelectedDate ? (
                  <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    Введите дату полностью в формате `ГГГГ-ММ-ДД`.
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || !hasValidSelectedDate}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                    Обновить
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Выйти
                  </button>
                </div>

                <div className="rounded-2xl bg-gray-100/80 px-4 py-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  Автообновление выполняется каждые 30 секунд, пока страница открыта.
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasError ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : 'Не удалось загрузить данные по соцпитанию.'}
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationalStats.map(({ key, label, hint }) => (
            <div
              key={key}
              className="glass rounded-3xl border border-gray-200/70 p-5 dark:border-gray-800/70"
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
              <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                {!hasValidSelectedDate
                  ? '-'
                  : summaryQuery.isLoading && !summary
                    ? '...'
                    : Number(summary?.[key] ?? 0).toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{hint}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl border border-gray-200/70 p-6 dark:border-gray-800/70">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">План питания</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Сколько приемов пищи нужно подготовить на выбранную дату.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mealPlanStats.map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-800/70 dark:bg-gray-950/50"
                >
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {!hasValidSelectedDate
                      ? '-'
                      : summaryQuery.isLoading && !summary
                        ? '...'
                        : Number(summary?.[key] ?? 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl border border-gray-200/70 p-6 dark:border-gray-800/70">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Быстрая сводка</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ключевые показатели для оперативной работы столовой.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Готовить всего приемов пищи</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {!hasValidSelectedDate
                    ? '-'
                    : summaryQuery.isLoading && !summary
                      ? '...'
                      : Number(summary?.planned_total_meals ?? 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Уже выдано по QR</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {!hasValidSelectedDate
                    ? '-'
                    : summaryQuery.isLoading && !summary
                      ? '...'
                      : Number(summary?.actual_redemptions ?? 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Планируют прийти</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {!hasValidSelectedDate
                    ? '-'
                    : summaryQuery.isLoading && !summary
                      ? '...'
                      : Number(summary?.students_planning_to_attend ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Список студентов</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Активные участники программы на выбранную дату с планом питания и фактическими выдачами.
              </p>
            </div>

            <div className="w-full max-w-3xl rounded-3xl border border-gray-200/70 bg-white/80 p-4 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/60">
              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по имени или email"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <label className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      checked={onlyWithMealSelections}
                      onChange={(event) => setOnlyWithMealSelections(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Есть выбор питания
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      checked={onlyPlanning}
                      onChange={(event) => setOnlyPlanning(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Планируют прийти
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      checked={onlyWithRedemptions}
                      onChange={(event) => setOnlyWithRedemptions(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Есть выдачи
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="glass overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800/70">
            <div className="flex flex-col gap-2 border-b border-gray-200/70 px-5 py-4 text-sm text-gray-500 dark:border-gray-800/70 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Показано студентов: {filteredStudents.length.toLocaleString()}</span>
              <span>Всего активных участников: {students.length.toLocaleString()}</span>
            </div>

            {studentsQuery.isLoading && !studentsQuery.data ? (
              <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загружаем список студентов...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="px-6 py-20 text-center text-sm text-gray-500 dark:text-gray-400">
                По текущим фильтрам студенты не найдены.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/70 text-sm dark:divide-gray-800/70">
                  <thead className="bg-gray-100/80 dark:bg-gray-900/70">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <th className="px-5 py-3 font-medium">ФИО</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Завтрак</th>
                      <th className="px-5 py-3 font-medium">Обед</th>
                      <th className="px-5 py-3 font-medium">Ужин</th>
                      <th className="px-5 py-3 font-medium">Запланировано</th>
                      <th className="px-5 py-3 font-medium">Фактические выдачи</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/70 dark:divide-gray-800/70">
                    {filteredStudents.map((student: SocialMealsStudent) => (
                      <tr
                        key={student.student_id}
                        className="bg-white/70 transition hover:bg-gray-50/80 dark:bg-transparent dark:hover:bg-gray-900/40"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {student.full_name}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{student.email}</td>
                        <td className="px-5 py-4"><BooleanCell value={student.wants_breakfast} /></td>
                        <td className="px-5 py-4"><BooleanCell value={student.wants_lunch} /></td>
                        <td className="px-5 py-4"><BooleanCell value={student.wants_dinner} /></td>
                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                          {student.planned_meals_count}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                          {student.redemptions_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
