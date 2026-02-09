'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { authAPI } from '../../lib/auth/api';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, CheckCircle2, Camera, ScanFace, ShieldCheck, X } from 'lucide-react';

// Declare FlowWidget on window for TypeScript
declare global {
  interface Window {
    FlowWidget?: {
      startSession: (config: {
        id: string;
        selector: string;
        locale: string;
      }) => void;
    };
  }
}

type LoginStatus = 'idle' | 'creating_session' | 'verifying' | 'checking_result' | 'success' | 'error';

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);
  const [widgetStarted, setWidgetStarted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const finishHandlerRef = useRef<((data: any) => void) | null>(null);

  // Find portal target on mount
  useEffect(() => {
    setPortalTarget(document.getElementById('biometric-portal'));
  }, []);

  // Handle widget finish event
  const handleFinish = useCallback(async (data: any) => {
    if (!sessionId || status === 'checking_result' || status === 'success') return;

    console.log('Biometric verification finished:', data?.detail);
    setStatus('checking_result');

    try {
      // Give Biometric.kz server time to finish processing the session
      // before we query the result
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await authAPI.verifyBiometricSession(sessionId);

      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        setStatus('success');

        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        throw new Error('Не получен токен доступа');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Ошибка проверки результата верификации');
      setStatus('error');
    }
  }, [sessionId, status, router]);

  // Register/unregister the finish event listener
  useEffect(() => {
    finishHandlerRef.current = handleFinish;

    const listener = (data: any) => {
      finishHandlerRef.current?.(data);
    };

    window.addEventListener('finish', listener);

    return () => {
      window.removeEventListener('finish', listener);
    };
  }, [handleFinish]);

  // Load the widget script when a session is created
  useEffect(() => {
    if (!sessionId || widgetScriptLoaded) return;

    if (window.FlowWidget) {
      setWidgetScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://remote.biometric.kz/widget/flow-widget.umd.js';
    script.async = true;
    script.onload = () => {
      console.log('FlowWidget script loaded');
      setWidgetScriptLoaded(true);
    };
    script.onerror = () => {
      setError('Не удалось загрузить виджет верификации. Проверьте подключение к интернету.');
      setStatus('error');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [sessionId, widgetScriptLoaded]);

  // Start the widget once script is loaded and DOM container is ready
  useEffect(() => {
    if (widgetScriptLoaded && sessionId && !widgetStarted && window.FlowWidget) {
      // Wait for the portal DOM element to be rendered
      const timer = setTimeout(() => {
        const container = document.getElementById('biometric-widget');
        if (!container) {
          console.warn('Widget container not found yet, retrying...');
          return;
        }
        try {
          window.FlowWidget!.startSession({
            id: sessionId,
            selector: '#biometric-widget',
            locale: 'ru',
          });
          setWidgetStarted(true);
          setStatus('verifying');
          console.log('FlowWidget started with session:', sessionId);
        } catch (err: any) {
          console.error('Failed to start FlowWidget:', err);
          setError('Ошибка запуска виджета верификации');
          setStatus('error');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [widgetScriptLoaded, sessionId, widgetStarted]);

  // Hide/show the login card and lock scroll when widget is active
  useEffect(() => {
    const isWidgetActive = sessionId && (
      status === 'creating_session' ||
      status === 'verifying' ||
      status === 'checking_result' ||
      (status === 'error' && widgetStarted)
    );

    const loginCard = document.getElementById('login-card-wrapper');

    if (isWidgetActive) {
      document.body.style.overflow = 'hidden';
      if (loginCard) loginCard.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      if (loginCard) loginCard.style.display = '';
    }

    return () => {
      document.body.style.overflow = '';
      if (loginCard) loginCard.style.display = '';
    };
  }, [status, sessionId, widgetStarted]);

  const handleStartVerification = async () => {
    setError(null);
    setStatus('creating_session');
    setWidgetStarted(false);

    try {
      const session = await authAPI.createBiometricSession();
      console.log('Biometric session created:', session);
      setSessionId(session.sessionId);
    } catch (err: any) {
      console.error('Session creation error:', err);
      setError(err.message || 'Не удалось создать сессию верификации');
      setStatus('error');
    }
  };

  const handleCancel = () => {
    setError(null);
    setSessionId(null);
    setWidgetStarted(false);
    setWidgetScriptLoaded(false);
    setStatus('idle');
  };

  // Determine if the full-screen widget overlay should be shown
  const showWidgetOverlay = sessionId && (
    status === 'creating_session' ||
    status === 'verifying' ||
    status === 'checking_result' ||
    (status === 'error' && widgetStarted)
  );

  // Widget overlay rendered via portal to escape all parent styling
  const widgetOverlay = showWidgetOverlay && portalTarget ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#ffffff',
      }}
    >
      {/*
        Minimal CSS for text readability on white background.
        IMPORTANT: Do NOT use * selector or !important — it breaks
        the widget's internal elements (SVG overlays, canvas, video processing)
        and can cause liveness detection to fail.
        We only set color on the container and let CSS inheritance work naturally.
      */}
      <style>{`
        #biometric-widget {
          color: #1f2937;
        }
      `}</style>

      {/* Floating cancel button - positioned absolutely so it doesn't steal space from the widget */}
      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#374151',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <X style={{ width: '14px', height: '14px' }} />
        Отмена
      </button>

      {/* Loading states - overlaid on top */}
      {(status === 'creating_session' || status === 'checking_result') && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <Loader2
            style={{ width: '40px', height: '40px', color: '#2563eb' }}
            className="animate-spin"
          />
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
            {status === 'creating_session'
              ? 'Создание сессии верификации...'
              : 'Проверка результата верификации...'}
          </p>
          {status === 'checking_result' && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
              Это может занять до 30 секунд
            </p>
          )}
        </div>
      )}

      {/* Error state - overlaid on top */}
      {status === 'error' && error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '14px', color: '#991b1b' }}>{error}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            style={{
              marginTop: '20px',
              padding: '10px 32px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/*
        Widget container - follows Biometric.kz docs EXACTLY:
        Parent (.flow-widget-container): width: 100vw, height: 100vh
        #flow-widget: width: 100%, height: 100%, position: relative, overflow: scroll
        
        NO top bar, NO flex column - the widget gets the FULL 100vw x 100vh
        as required by the documentation.
      */}
      <div
        id="biometric-widget"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'scroll',
        }}
      />
    </div>,
    portalTarget,
  ) : null;

  return (
    <>
      {/* Idle state - show inside the login card */}
      {!showWidgetOverlay && status !== 'success' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Потребуется доступ к камере для проверки личности
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <ScanFace className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Верификация через eGov (ИИН + SMS код)
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Сравнение лица с документом для подтверждения
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleStartVerification}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            <ScanFace className="w-5 h-5" />
            <span>Начать верификацию</span>
          </button>
        </div>
      )}

      {/* Success state */}
      {status === 'success' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Верификация пройдена!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Перенаправление...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal-rendered full-screen widget overlay */}
      {widgetOverlay}
    </>
  );
}
