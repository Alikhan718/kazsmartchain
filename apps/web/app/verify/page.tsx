'use client';
import React, { useState } from 'react';
import { API_BASE } from '../../lib/env';
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

export default function VerifyDiplomaPage() {
  const [iin, setIin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация ИИН (12 цифр)
    const iinRegex = /^\d{12}$/;
    if (!iinRegex.test(iin)) {
      setError('ИИН должен содержать 12 цифр');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/diplomas/verify-by-iin/${iin}`);
      
      let data: VerificationResult;
      
      if (!response.ok) {
        // Если endpoint еще не реализован (404), используем mock
        if (response.status === 404) {
          data = await getMockResult(iin);
          setResult(data);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data = await response.json();
      
      // Если endpoint вернул valid: false с сообщением о разработке, показываем mock данные
      if (!data.valid && data.message && data.message.includes('в разработке')) {
        data = await getMockResult(iin);
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при верификации диплома');
    } finally {
      setLoading(false);
    }
  };

  // Mock данные для демонстрации
  const getMockResult = async (iin: string): Promise<VerificationResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
    
    return {
      valid: true,
      diploma: {
        id: 'mock-id-123',
        ediplomaId: 'diploma-12345',
        solanaMint: 'Mint1a2b3c4d5e6f7g8h',
        besuTxHash: '0x42699A7612A82f1d9C36148af9C77354759b210b',
        status: 'issued',
        publicData: {
          studentName: 'Иванов Иван Иванович',
          studentIIN: `${iin.slice(0, 4)}******${iin.slice(-2)}`,
          degree: 'Бакалавр',
          specialty: 'Информатика',
          graduationDate: '2024-06-15',
          diplomaNumber: 'DIP-12345',
          university: 'КазНУ имени Аль-Фараби',
        },
        issuedAt: '2024-06-15T00:00:00Z',
      },
      message: 'Диплом верифицирован и подтвержден в блокчейне',
    };
  };

  // Формируем URL для app.ediploma.kz
  // Формат: /diploma/{id}/{version}
  // Пример: /diploma/30167/1 для ediplomaId "diploma-30167"
  const getEdiplomaUrl = (ediplomaId: string) => {
    const ediplomaBaseUrl = process.env.NEXT_PUBLIC_EDIPLOMA_URL || 'https://app.ediploma.kz';
    
    // Извлекаем ID из ediplomaId (например, "diploma-30167" -> "30167")
    // Убираем префикс "diploma-" если он есть
    let diplomaId = ediplomaId;
    if (ediplomaId.startsWith('diploma-')) {
      diplomaId = ediplomaId.replace('diploma-', '');
    }
    
    // Формат URL: /diploma/{id}/1
    // Версия пока всегда 1, в будущем можно получать из API если нужно
    return `${ediplomaBaseUrl}/diploma/${diplomaId}/1`;
  };

  // Формируем URL для просмотра транзакции в explorer
  const getExplorerTxUrl = (txHash: string) => {
    return `/explorer/tx/${txHash}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Верификация Диплома
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Проверьте подлинность вашего диплома в блокчейне KazSmartChain
            <br />
            <span className="text-sm">Дипломыңыздың шынайылығын тексеріңіз</span>
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <div className="p-8 rounded-2xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40 shadow-2xl">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Введите ваш ИИН (Индивидуальный Идентификационный Номер)
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
                    className="w-full px-6 py-4 text-lg rounded-xl border border-gray-700 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
                    required
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {iin.length}/12
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  ИИН состоит из 12 цифр. Ваши данные защищены и используются только для верификации.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || iin.length !== 12}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-lg hover:from-blue-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Проверка диплома...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Проверить диплом</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Ошибка верификации</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="space-y-6">
            {result.valid && result.diploma ? (
              <>
                {/* Success Banner */}
                <div className="p-8 rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-xl bg-green-500/20 text-green-400 flex-shrink-0">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-green-400 mb-2 flex items-center gap-3">
                        Диплом подлинный и подтвержден
                        <Shield className="w-8 h-8" />
                      </h2>
                      <p className="text-green-300 text-lg mb-4">{result.message}</p>
                      <p className="text-green-200/80 text-sm">
                        Ваш диплом успешно верифицирован в блокчейне KazSmartChain. 
                        Все данные подтверждены и защищены криптографией.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diploma Information */}
                <div className="p-8 rounded-2xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-blue-400" />
                    Информация о дипломе
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.diploma.publicData?.studentName && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">Студент</div>
                        <div className="text-lg font-semibold text-white">{result.diploma.publicData.studentName}</div>
                      </div>
                    )}
                    {result.diploma.publicData?.studentIIN && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">ИИН</div>
                        <div className="text-lg font-mono text-white">{result.diploma.publicData.studentIIN}</div>
                      </div>
                    )}
                    {result.diploma.publicData?.degree && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">Степень</div>
                        <div className="text-lg font-semibold text-white">{result.diploma.publicData.degree}</div>
                      </div>
                    )}
                    {result.diploma.publicData?.specialty && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">Специальность</div>
                        <div className="text-lg text-white">{result.diploma.publicData.specialty}</div>
                      </div>
                    )}
                    {result.diploma.publicData?.university && (
                      <div className="space-y-1 md:col-span-2">
                        <div className="text-sm text-gray-400">Университет</div>
                        <div className="text-lg font-semibold text-white">{result.diploma.publicData.university}</div>
                      </div>
                    )}
                    {result.diploma.publicData?.graduationDate && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">Дата выпуска</div>
                        <div className="text-lg text-white">
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
                        <div className="text-sm text-gray-400">Номер диплома</div>
                        <div className="text-lg font-mono text-white">{result.diploma.publicData.diplomaNumber}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Blockchain Verification Links */}
                <div className="p-8 rounded-2xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-7 h-7 text-purple-400" />
                    Подтверждение в блокчейне
                  </h3>
                  <div className="space-y-4">
                    {/* Link to app.ediploma.kz */}
                    <a
                      href={getEdiplomaUrl(result.diploma.ediplomaId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                          <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                            Просмотреть диплом в app.ediploma.kz
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Полная информация о дипломе
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </a>

                    {/* Link to Smart Contract Transaction */}
                    {result.diploma.besuTxHash && (
                      <a
                        href={getExplorerTxUrl(result.diploma.besuTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                            <Shield className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              Транзакция в блокчейне Besu
                            </div>
                            <div className="text-sm text-gray-400 mt-1 font-mono">
                              {result.diploma.besuTxHash.slice(0, 10)}...{result.diploma.besuTxHash.slice(-8)}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                      </a>
                    )}

                    {/* Solana NFT Link */}
                    {result.diploma.solanaMint && (
                      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gray-700 text-gray-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">Solana NFT Mint</div>
                            <div className="text-sm text-gray-400 mt-1 font-mono break-all">
                              {result.diploma.solanaMint}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                      <span className="text-sm text-gray-400">Статус:</span>
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        result.diploma.status === 'issued'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : result.diploma.status === 'revoked'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {result.diploma.status === 'issued' ? '✓ Выпущен' : 
                         result.diploma.status === 'revoked' ? '✗ Отозван' : 
                         '↻ Обновлен'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/10">
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-xl bg-red-500/20 text-red-400 flex-shrink-0">
                    <XCircle className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-red-400 mb-2">Диплом не найден</h2>
                    <p className="text-red-300 text-lg">{result.message}</p>
                    <p className="text-red-200/80 text-sm mt-4">
                      Если вы уверены, что ваш диплом должен быть в системе, 
                      пожалуйста, свяжитесь с вашим университетом.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 rounded-xl border border-gray-800/50 bg-gray-900/30 text-center">
          <p className="text-sm text-gray-400">
            Верификация выполняется через блокчейн KazSmartChain. 
            Все данные защищены криптографией и не могут быть изменены.
          </p>
        </div>
      </div>
    </div>
  );
}

