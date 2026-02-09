'use client';

import { LoginForm } from '../../components/auth/LoginForm';
import { Logo } from '../../components/Logo';
import { ScanFace, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <>
      {/* Login card wrapper */}
      <div
        id="login-card-wrapper"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-lg w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Вход в систему
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Войдите с помощью биометрии
            </p>
          </div>

          {/* Login Form Card */}
          <div className="glass-strong rounded-2xl border border-gray-200 dark:border-gray-800/50 p-8 shadow-xl">
            {/* Security Info */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-start gap-3">
                <ScanFace className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Безопасная верификация
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Используйте камеру для подтверждения личности. 
                    Процесс включает верификацию и сравнение лица.
                  </p>
                </div>
              </div>
            </div>

            {/* Login Form (idle/success states render here) */}
            <LoginForm />

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Безопасная биометрия</span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Нужна помощь?{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Свяжитесь с поддержкой
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Full-screen widget portal target - rendered outside the card */}
      <div id="biometric-portal" />
    </>
  );
}
