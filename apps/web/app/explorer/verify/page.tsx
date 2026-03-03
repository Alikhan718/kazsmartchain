'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { EDIPLOMA_API_URL } from '../../../lib/env';
import { Search, CheckCircle, XCircle, FileText, Shield, ExternalLink, Loader2, GraduationCap, Link as LinkIcon } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  diploma?: {
    id: string;
    ediplomaId: string;
    solanaMint?: string;
    besuTxHash?: string;
    status: string;
    publicData?: {
      studentName?: string;
      studentIIN?: string;
      degree?: string;
      specialty?: string;
      graduationDate?: string;
      diplomaNumber?: string;
      university?: string;
    };
    issuedAt?: string;
  };
  message: string;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [iin, setIin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoVerified, setHasAutoVerified] = useState(false);

  const verifyDiplomaByIIN = useCallback(async (iinToVerify: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setHasAutoVerified(true);

    try {
      const response = await fetch(`${EDIPLOMA_API_URL}/diploma/verify-by-iin/${iinToVerify}`);

      if (!response.ok) {
        if (response.status === 404) {
          setResult({
            valid: false,
            message: 'Диплом с данным ИИН не найден в системе.',
          });
          setLoading(false);
          return;
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data: VerificationResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при проверке диплома';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const iinParam = searchParams.get('iin');
    if (iinParam) {
      const iinRegex = /^\d{12}$/;
      const cleanIin = iinParam.replace(/\D/g, '').slice(0, 12);

      if (iinRegex.test(cleanIin)) {
        setIin(cleanIin);
        verifyDiplomaByIIN(cleanIin);
      } else {
        setError('ИИН должен содержать 12 цифр');
        setIin(cleanIin);
      }
    }
  }, [searchParams, verifyDiplomaByIIN]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const iinRegex = /^\d{12}$/;
    if (!iinRegex.test(iin)) {
      setError('ИИН должен содержать 12 цифр');
      return;
    }

    await verifyDiplomaByIIN(iin);
  };

  const getEdiplomaUrl = (ediplomaId: string) => {
    const ediplomaBaseUrl = process.env.NEXT_PUBLIC_EDIPLOMA_URL || 'https://app.ediploma.kz';

    let diplomaId = ediplomaId;
    if (ediplomaId.startsWith('diploma-')) {
      diplomaId = ediplomaId.replace('diploma-', '');
    }

    return `${ediplomaBaseUrl}/diploma/${diplomaId}/1`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 dark:bg-white/5 mb-4">
          <GraduationCap className="w-7 h-7 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Проверка диплома
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto">
          Проверьте подлинность диплома в нашей системе верификации
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Введите ИИН (Индивидуальный идентификационный номер)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={iin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setIin(value);
                    setResult(null);
                    setError(null);
                  }}
                  placeholder="123456789012"
                  maxLength={12}
                  className="w-full px-6 py-4 text-lg rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 font-mono"
                  required
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                  {iin.length}/12
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                ИИН состоит из 12 цифр. Ваши данные защищены и используются только для верификации.
              </p>
              {hasAutoVerified && searchParams.get('iin') && (
                <p className="mt-2 text-xs text-brand-500">
                  Верификация выполнена автоматически по ссылке
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || iin.length !== 12}
              className="w-full px-8 py-4 rounded-md bg-navy-900 dark:bg-brand-500 hover:bg-navy-800 dark:hover:bg-brand-600 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Проверка диплома...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  <span>{hasAutoVerified ? 'Проверить снова' : 'Проверить диплом'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto card p-6 border-red-200 dark:border-red-500/20">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Ошибка верификации</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {result && (
        <div className="max-w-3xl mx-auto space-y-6">
          {result.valid && result.diploma ? (
            <>
              {/* Success Banner */}
              <div className="card p-8 border-green-200 dark:border-green-500/20">
                <div className="flex items-start gap-6">
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex-shrink-0">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-3">
                      Диплом подтвержден
                      <Shield className="w-6 h-6" />
                    </h2>
                    <p className="text-green-600 dark:text-green-400/80">
                      Все данные подтверждены и криптографически защищены.
                    </p>
                  </div>
                </div>
              </div>

              {/* Diploma Information */}
              <div className="card p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  Информация о дипломе
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.diploma.publicData?.studentName && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Студент</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{result.diploma.publicData.studentName}</div>
                    </div>
                  )}
                  {result.diploma.publicData?.studentIIN && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">ИИН</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">{result.diploma.publicData.studentIIN}</div>
                    </div>
                  )}
                  {result.diploma.publicData?.degree && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Степень</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{result.diploma.publicData.degree}</div>
                    </div>
                  )}
                  {result.diploma.publicData?.specialty && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Специальность</div>
                      <div className="text-lg text-gray-900 dark:text-white">{result.diploma.publicData.specialty}</div>
                    </div>
                  )}
                  {result.diploma.publicData?.university && (
                    <div className="space-y-1 md:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Университет</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{result.diploma.publicData.university}</div>
                    </div>
                  )}
                  {result.diploma.publicData?.graduationDate && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Дата окончания</div>
                      <div className="text-lg text-gray-900 dark:text-white">
                        {new Date(result.diploma.publicData.graduationDate).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                  {result.diploma.publicData?.diplomaNumber && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Номер диплома</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">{result.diploma.publicData.diplomaNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Blockchain Confirmation — only ediploma link */}
              <div className="card p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-gray-400" />
                  Подтверждение
                </h3>
                <div className="space-y-4">
                  <a
                    href={getEdiplomaUrl(result.diploma.ediplomaId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:text-brand-500 transition-colors">
                        <LinkIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                          Посмотреть диплом на app.ediploma.kz
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Полная информация о дипломе
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  </a>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Статус:</span>
                    <span className={`px-4 py-2 rounded-md text-sm font-semibold ${
                      result.diploma.status === 'issued'
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                        : result.diploma.status === 'revoked'
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                    }`}>
                      {result.diploma.status === 'issued' ? 'Выдан' :
                       result.diploma.status === 'revoked' ? 'Отозван' :
                       'Обновлен'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-8 border-red-200 dark:border-red-500/20">
              <div className="flex items-start gap-6">
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex-shrink-0">
                  <XCircle className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Диплом не найден</h2>
                  <p className="text-gray-700 dark:text-gray-300">{result.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Если вы уверены, что ваш диплом должен быть в системе,
                    свяжитесь с вашим учебным заведением.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
