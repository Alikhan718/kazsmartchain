'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../../../../lib/client';
import { Coins, Plus, Send, Loader2, RefreshCw, Clock, User, Tag } from 'lucide-react';

export default function TokensPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [pool, setPool] = useState('');
  const [to, setTo] = useState('');
  const [tokenId, setTokenId] = useState('1');
  const [amount, setAmount] = useState('1');
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  // Recent actions from audit (tokens.*)
  const { data, refetch } = useQuery({
    queryKey: ['tokens-audit', orgId],
    queryFn: async () => {
      const all = await createClient(orgId).listAudit(orgId);
      return all.events.filter((e) => e.eventType.startsWith('tokens.'));
    },
    enabled: !!orgId,
  });

  async function call(path: string, body: any, action: string) {
    if (!orgId) {
      setResult('Ошибка: ID организации не загружен');
      return;
    }
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/besu/firefly/${orgId}/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(errorData.message || `Ошибка ${res.status}`);
      }
      
      const data = await res.json();
      setResult(`Операция "${action}" выполнена успешно`);
      // Обновляем список событий через небольшую задержку, чтобы дать время API обработать
      setTimeout(() => refetch(), 500);
    } catch (error: any) {
      setResult(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Token operation error:', error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          ERC-1155 Токены
        </h1>
        <p className="text-gray-400 text-lg">Управление пулами токенов и переводы</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Создать пул</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (orgId) call('tokens/pools', { type: 'fungible', name: pool || 'demo' }, 'создание пула'); }} className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Название пула"
              value={pool}
              onChange={(e) => setPool(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy === 'создание пула' || !orgId}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'создание пула' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Создать пул</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Send className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Перевод токенов</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (orgId) call('tokens/transfer', { pool, tokenId: Number(tokenId), to, amount: Number(amount) }, 'перевод'); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-gray-700 rounded-lg p-2 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                placeholder="Пул"
                value={pool}
                onChange={(e) => setPool(e.target.value)}
              />
              <input
                className="border border-gray-700 rounded-lg p-2 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm font-mono"
                placeholder="Получатель"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <input
                className="border border-gray-700 rounded-lg p-2 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                placeholder="ID токена"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
              <input
                className="border border-gray-700 rounded-lg p-2 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                placeholder="Количество"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy === 'перевод' || !pool || !to || !orgId}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'перевод' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Отправить</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400">
          {result}
        </div>
      )}

      {/* История операций */}
      {data && data.length > 0 && (
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Последние операции с токенами</h2>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {data.map((e) => (
              <div
                key={e.id}
                className="p-3 rounded-lg border border-gray-800/50 bg-gray-900/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{e.eventType}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(e.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
                {e.signer && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {e.signer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

