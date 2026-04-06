import { redirect } from 'next/navigation';
import { LockKeyhole, UtensilsCrossed } from 'lucide-react';

import { SocialMealsLoginForm } from '../../../components/social-meals/SocialMealsLoginForm';
import { getOptionalSocialMealsSession } from '../../../lib/social-meals/auth';

export default async function SocialMealsLoginPage() {
  const session = await getOptionalSocialMealsSession();

  if (session) {
    redirect('/social-meals');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-10 dark:from-[#090d18] dark:via-[#0a0e1a] dark:to-[#10192c]">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-3xl border border-gray-200/80 p-8 shadow-2xl dark:border-gray-800/70">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Админ панель социального питания</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Защищенный вход для сотрудников столовой и NU Impact Foundation.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Эта страница использует отдельную серверную сессию. Jasaim admin token никогда не попадает в браузер.
              </p>
            </div>
          </div>

          <SocialMealsLoginForm />
        </div>
      </div>
    </div>
  );
}
