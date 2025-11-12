'use client';
import React, { useEffect, useState } from 'react';
import { RELAY_BASE } from '../../../../lib/env';
import { ArrowRight, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function RelayPage({ params }: { params: Promise<{ id: string }> }) {
  const [status, setStatus] = useState<'unknown' | 'ok' | 'down'>('unknown');
  const [loading, setLoading] = useState(true);

  async function ping() {
    setLoading(true);
    try {
      const res = await fetch(`${RELAY_BASE}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus(data.status === 'ok' ? 'ok' : 'down');
      } else {
        setStatus('down');
      }
    } catch (error) {
      console.error('Relay health check failed:', error);
      setStatus('down');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ping();
  }, []);

  const statusConfig = {
    ok: { label: 'Работает', color: 'green', icon: CheckCircle },
    down: { label: 'Недоступен', color: 'red', icon: XCircle },
    unknown: { label: 'Проверка...', color: 'gray', icon: Loader2 },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Релейный сервис
        </h1>
        <p className="text-gray-400 text-lg">Мониторинг статуса релейного сервиса для синхронизации данных</p>
      </div>

      <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Статус сервиса</h2>
          </div>
          <button
            onClick={ping}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-lg ${
            status === 'ok' ? 'bg-green-500/20 border-green-500/20' :
            status === 'down' ? 'bg-red-500/20 border-red-500/20' :
            'bg-gray-500/20 border-gray-500/20'
          } border`}>
            <Icon className={`w-8 h-8 ${
              status === 'ok' ? 'text-green-400' :
              status === 'down' ? 'text-red-400' :
              'text-gray-400'
            } ${status === 'unknown' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Текущий статус</div>
            <div className={`text-2xl font-bold ${
              status === 'ok' ? 'text-green-400' :
              status === 'down' ? 'text-red-400' :
              'text-gray-400'
            }`}>{config.label}</div>
            {status === 'down' && (
              <div className="text-xs text-gray-500 mt-2">
                URL: {RELAY_BASE}/health
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

