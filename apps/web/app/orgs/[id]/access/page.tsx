'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { Shield, Upload, CheckCircle, Loader2, Key, RefreshCw, Calendar, Fingerprint, AlertCircle, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Certificate {
  id: string;
  fingerprint: string;
  notBefore?: string;
  notAfter?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [pem, setPem] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPem, setShowPem] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  const { data: certificates, isLoading, refetch } = useQuery<Certificate[]>({
    queryKey: ['certificates', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await fetch(`${API_BASE}/api/certs/${orgId}`, {
        headers: { authorization: `Bearer ${getDevToken(orgId)}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificates');
      return res.json();
    },
    enabled: !!orgId,
  });

  async function upload() {
    if (!pem || !orgId) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/certs/${orgId}/upload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify({ pem }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(errorData.message || `Ошибка ${res.status}`);
      }
      
      setResult('Сертификат успешно загружен');
      setPem('');
      setTimeout(() => refetch(), 500);
    } catch (error: any) {
      setResult(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Upload error:', error);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(certId: string) {
    if (!orgId) return;
    setToggling(certId);
    try {
      const res = await fetch(`${API_BASE}/api/certs/${orgId}/${certId}/toggle`, {
        method: 'POST',
        headers: { authorization: `Bearer ${getDevToken(orgId)}` },
      });
      if (!res.ok) throw new Error('Failed to toggle certificate');
      setTimeout(() => refetch(), 300);
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`);
    } finally {
      setToggling(null);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatFingerprint(fp: string): string {
    return `${fp.substring(0, 16)}...${fp.substring(fp.length - 16)}`;
  }

  function isExpired(notAfter?: string): boolean {
    if (!notAfter) return false;
    return new Date(notAfter) < new Date();
  }

  function isExpiringSoon(notAfter?: string): boolean {
    if (!notAfter) return false;
    const daysUntilExpiry = (new Date(notAfter).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Доступ и роли
        </h1>
        <p className="text-gray-400 text-lg">Управление X.509 сертификатами для аутентификации и контроля доступа</p>
      </div>

      {/* Загрузка нового сертификата */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Upload className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Загрузка нового сертификата</h2>
        </div>
        <div className="space-y-4">
          <textarea
            className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-xs h-40 resize-none"
            placeholder="-----BEGIN CERTIFICATE-----&#10;MIIFXTCCA0WgAwIBAgIJAKZ7Z...&#10;-----END CERTIFICATE-----"
            value={pem}
            onChange={(e) => setPem(e.target.value)}
          />
          <button
            onClick={upload}
            disabled={busy || !pem || !orgId}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Загрузить сертификат</span>
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-xl border ${
          result.startsWith('Ошибка') 
            ? 'border-red-500/20 bg-red-500/10 text-red-400' 
            : 'border-green-500/20 bg-green-500/10 text-green-400'
        } flex items-center gap-2`}>
          {result.startsWith('Ошибка') ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {result}
        </div>
      )}

      {/* Список сертификатов */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Сертификаты организации</h2>
              <p className="text-sm text-gray-400 mt-1">
                {isLoading ? 'Загрузка...' : certificates ? `${certificates.length} ${certificates.length === 1 ? 'сертификат' : certificates.length < 5 ? 'сертификата' : 'сертификатов'}` : 'Нет сертификатов'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Загрузка сертификатов...</p>
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="space-y-3">
            {certificates.map((cert) => {
              const expired = isExpired(cert.notAfter);
              const expiringSoon = isExpiringSoon(cert.notAfter);
              return (
                <div
                  key={cert.id}
                  className={`p-4 rounded-lg border ${
                    expired
                      ? 'border-red-500/30 bg-red-500/5'
                      : expiringSoon
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : cert.active
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-gray-800/50 bg-gray-900/50'
                  } transition-all hover:border-gray-700`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          expired
                            ? 'bg-red-500/20 text-red-400'
                            : expiringSoon
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : cert.active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          <Key className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${
                              expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-white'
                            }`}>
                              {cert.active ? 'Активен' : 'Неактивен'}
                            </span>
                            {expired && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                Истек
                              </span>
                            )}
                            {expiringSoon && !expired && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Истекает скоро
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <Fingerprint className="w-3 h-3" />
                            <span className="truncate">{formatFingerprint(cert.fingerprint)}</span>
                            <button
                              onClick={() => copyToClipboard(cert.fingerprint, cert.id)}
                              className="p-1 rounded hover:bg-gray-800/50 transition-colors"
                              title="Копировать fingerprint"
                            >
                              {copied === cert.id ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span className="text-gray-500">Действителен с:</span>
                          <span className="text-gray-300">{formatDate(cert.notBefore)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span className="text-gray-500">Действителен до:</span>
                          <span className={`${
                            expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            {formatDate(cert.notAfter)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Shield className="w-3 h-3" />
                          <span className="text-gray-500">Загружен:</span>
                          <span className="text-gray-300">{formatDate(cert.createdAt)}</span>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setShowPem({ ...showPem, [cert.id]: !showPem[cert.id] })}
                          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPem[cert.id] ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Скрыть</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Показать</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleActive(cert.id)}
                          disabled={toggling === cert.id || expired}
                          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            cert.active
                              ? 'text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/20'
                              : 'text-green-400 hover:bg-green-500/10 border border-green-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {toggling === cert.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>...</span>
                            </>
                          ) : cert.active ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Деактивировать</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Активировать</span>
                            </>
                          )}
                        </button>
                      </div>
                      {showPem[cert.id] && (
                        <div className="mt-2 p-3 rounded bg-gray-950 border border-gray-800/50">
                          <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">
                            Fingerprint: {cert.fingerprint}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Сертификаты не найдены</p>
            <p className="text-xs text-gray-500 mt-2">Загрузите первый сертификат выше</p>
          </div>
        )}
      </div>
    </div>
  );
}
