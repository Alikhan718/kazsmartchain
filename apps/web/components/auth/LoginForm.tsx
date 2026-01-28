'use client';

import { useState, useEffect } from 'react';
import { CertificateSelector } from './CertificateSelector';
import { NCALayerClient } from '../../lib/ncalayer/client';
import { authAPI } from '../../lib/auth/api';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, CheckCircle2, Shield } from 'lucide-react';

export interface Certificate {
  alias: string;
  storageName: string; // Имя хранилища (PKCS12, eToken и т.д.) - используется для подписи
  certificate: string;
  subject: {
    commonName?: string;
    surname?: string;
    givenName?: string;
    organizationName?: string;
    email?: string;
  };
  issuer: {
    commonName?: string;
    organizationName?: string;
  };
  validFrom: Date;
  validTo: Date;
}

export function LoginForm() {
  const router = useRouter();
  const [ncaLayer, setNcaLayer] = useState<NCALayerClient | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [initError, setInitError] = useState<string | null>(null);

  // Инициализация NCALayer
  useEffect(() => {
    const initNCALayer = async () => {
      try {
        const client = new NCALayerClient();
        await client.init();
        setNcaLayer(client);
        
        // Загрузить сертификаты
        const certs = await client.getCertificates();
        setCertificates(certs);
        
        if (certs.length === 0) {
          setInitError('Не найдено доступных сертификатов. Убедитесь, что NCALayer установлен и запущен.');
        }
      } catch (err: any) {
        console.error('NCALayer initialization error:', err);
        setInitError(
          err.message || 
          'Не удалось инициализировать NCALayer. Убедитесь, что NCALayer установлен и запущен.'
        );
      }
    };

    initNCALayer();
  }, []);

  const handleLogin = async () => {
    if (!selectedCert || !ncaLayer) {
      setError('Выберите сертификат для входа');
      return;
    }

    // Проверяем валидность сертификата, но не блокируем вход
    const now = new Date();
    const isCertValid = selectedCert.validFrom <= now && selectedCert.validTo >= now;
    if (!isCertValid) {
      // Показываем предупреждение, но продолжаем процесс входа
      console.warn('Выбран истекший сертификат. Попытка входа может не удаться.');
    }

    setLoading(true);
    setError(null);
    setStatus('loading');

    try {
      // 1. Получить challenge от сервера
      const challengeResponse = await authAPI.getChallenge();
      const { challenge, nonce } = challengeResponse;
      console.log('Challenge received:', { challenge: challenge.substring(0, 50) + '...', nonce: nonce.substring(0, 8) + '...' });

      // 2. Конвертируем challenge в Base64 для подписи
      // NCALayer ожидает данные в Base64 формате
      const challengeBase64 = btoa(unescape(encodeURIComponent(challenge)));
      console.log('Challenge Base64:', challengeBase64.substring(0, 50) + '...');

      // 3. Проверяем сертификат перед отправкой
      console.log('Certificate info:', {
        alias: selectedCert.alias,
        storageName: selectedCert.storageName,
        certLength: selectedCert.certificate.length,
        certPreview: selectedCert.certificate.substring(0, 200),
        certEnd: selectedCert.certificate.substring(Math.max(0, selectedCert.certificate.length - 100)),
        hasPemHeaders: selectedCert.certificate.includes('-----BEGIN CERTIFICATE-----'),
        hasPemEnd: selectedCert.certificate.includes('-----END CERTIFICATE-----'),
        fullCert: selectedCert.certificate, // Полный сертификат для отладки
      });

      // 4. Подписать challenge через NCALayer
      // Используем storageName (имя хранилища), а не alias ключа
      const signature = await ncaLayer.signData(
        selectedCert.storageName,
        challengeBase64
      );
      console.log('Signature received:', {
        length: signature.length,
        preview: signature.substring(0, 50) + '...',
      });

      // 5. Отправить на сервер для аутентификации
      // Отправляем challenge в Base64 как data, чтобы сервер мог проверить подпись
      const loginRequest = {
        certificate: selectedCert.certificate,
        signature: signature, // CMS подпись в Base64
        nonce: nonce,
        data: challengeBase64, // Данные которые были подписаны (в Base64)
      };
      console.log('Login request:', {
        certLength: loginRequest.certificate.length,
        signatureLength: loginRequest.signature.length,
        dataLength: loginRequest.data.length,
        nonce: loginRequest.nonce.substring(0, 8) + '...',
      });

      const loginResponse = await authAPI.login(loginRequest);

      // 4. Сохранить токены
      if (loginResponse.accessToken) {
        localStorage.setItem('accessToken', loginResponse.accessToken);
        if (loginResponse.refreshToken) {
          localStorage.setItem('refreshToken', loginResponse.refreshToken);
        }

        setStatus('success');
        
        // 5. Перенаправить на главную страницу через небольшую задержку
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        throw new Error('Не получен токен доступа');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Более понятные сообщения об ошибках
      let errorMessage = err.message || 'Ошибка аутентификации. Проверьте правильность сертификата и попробуйте снова.';
      
      if (err.message?.includes('отмен')) {
        errorMessage = 'Операция подписи была отменена. Пожалуйста, повторите попытку и введите PIN-код при запросе.';
      } else if (err.message?.includes('Invalid signature')) {
        errorMessage = 'Подпись не прошла проверку. Убедитесь, что используется правильный сертификат и PIN-код.';
      } else if (err.message?.includes('certificate')) {
        errorMessage = 'Ошибка обработки сертификата. Убедитесь, что сертификат действителен и не истек срок его действия.';
      }
      
      setError(errorMessage);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Если NCALayer не инициализирован
  if (initError) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Ошибка инициализации
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {initError}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Как установить NCALayer:
          </h4>
          <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>Скачайте NCALayer с официального сайта НУЦ РК</li>
            <li>Установите программу на ваше устройство</li>
            <li>Запустите NCALayer</li>
            <li>Обновите эту страницу</li>
          </ol>
        </div>
      </div>
    );
  }

  // Если сертификаты загружаются
  if (!ncaLayer || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Загрузка сертификатов...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate Selector */}
      <CertificateSelector
        certificates={certificates}
        selected={selectedCert}
        onSelect={setSelectedCert}
      />

      {/* Warning for expired certificate */}
      {selectedCert && (() => {
        const now = new Date();
        const isCertValid = selectedCert.validFrom <= now && selectedCert.validTo >= now;
        if (!isCertValid) {
          return (
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Выбран истекший сертификат. Вход может не удаться, если сервер не принимает истекшие сертификаты.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Успешный вход! Перенаправление...
            </p>
          </div>
        </div>
      )}

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={!selectedCert || loading || status === 'success'}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
      >
        {loading || status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Вход в систему...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Успешно!</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Войти с ЭЦП</span>
          </>
        )}
      </button>
    </div>
  );
}

