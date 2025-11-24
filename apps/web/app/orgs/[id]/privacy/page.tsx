'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { Lock, Send, CheckCircle, Loader2, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TransactionInfo {
  hash: string;
  blockNumber?: string;
  blockHash?: string;
  from?: string;
  to?: string;
  value?: string;
  gasUsed?: string;
  status?: string;
  timestamp?: string;
}

export default function PrivacyPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [to, setTo] = useState('0x0000000000000000000000000000000000000000');
  const [pg, setPg] = useState('pg1');
  const [data, setData] = useState('0x');
  const [value, setValue] = useState('0x0');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  // Запрос информации о транзакции через Besu RPC
  const { data: txInfo, refetch: refetchTxInfo, isLoading: loadingTxInfo } = useQuery<TransactionInfo | null>({
    queryKey: ['besu-transaction', txHash],
    queryFn: async (): Promise<TransactionInfo | null> => {
      if (!txHash) return null;
      try {
        // Сначала получаем транзакцию
        const txRes = await fetch(`${API_BASE}/api/besu/rpc/transaction/${txHash}`, {
          headers: { authorization: `Bearer ${getDevToken(orgId)}` },
        });
        if (!txRes.ok) throw new Error('Transaction not found');
        const tx = await txRes.json();

        // Затем получаем квитанцию для статуса
        let receipt = null;
        try {
          const receiptRes = await fetch(`${API_BASE}/api/besu/rpc/transaction/${txHash}/receipt`, {
            headers: { authorization: `Bearer ${getDevToken(orgId)}` },
          });
          if (receiptRes.ok) {
            receipt = await receiptRes.json();
          }
        } catch {}

        return {
          hash: txHash,
          blockNumber: tx.blockNumber,
          blockHash: tx.blockHash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasUsed: receipt?.gasUsed,
          status: receipt ? (parseInt(receipt.status, 16) === 1 ? 'success' : 'failed') : 'pending',
        };
      } catch (err: any) {
        throw new Error(err.message || 'Failed to fetch transaction info');
      }
    },
    enabled: !!txHash && !!orgId,
    refetchInterval: txHash ? 5000 : false, // Обновляем каждые 5 секунд если транзакция pending
  });

  async function sendTx(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTxHash(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/besu/firefly/${orgId}/tx/private`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify({ 
          to: to || undefined,
          privacyGroupId: pg || undefined,
          data: data || '0x',
          value: value || '0x0',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(errorData.message || `Ошибка ${res.status}`);
      }

      const result = await res.json();
      
      // Извлекаем хеш транзакции из ответа FireFly
      // FireFly может вернуть разные форматы ответа
      const hash = result.besu_tx_hash || result.txHash || result.id || result.hash;
      
      if (hash) {
        setTxHash(hash);
      } else {
        setError('Транзакция отправлена, но хеш не получен. Ответ: ' + JSON.stringify(result));
      }
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      setBusy(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Приватные группы
        </h1>
        <p className="text-gray-400 text-lg">Отправка приватных транзакций в приватные группы</p>
      </div>

      <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Отправить приватную транзакцию</h2>
        </div>
        <form onSubmit={sendTx} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Адрес получателя (опционально)</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ID приватной группы (опционально)</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                value={pg}
                onChange={(e) => setPg(e.target.value)}
                placeholder="pg1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Данные транзакции (hex)</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono text-sm"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="0x"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Значение (wei, hex)</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono text-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0x0"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Отправить транзакцию</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-6 rounded-xl border border-red-500/20 glass bg-gradient-to-br from-red-500/10 to-red-600/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Ошибка</h3>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {txHash && (
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {txInfo?.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : txInfo?.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {txInfo?.status === 'success' 
                  ? 'Транзакция подтверждена' 
                  : txInfo?.status === 'failed'
                  ? 'Транзакция отклонена'
                  : 'Транзакция отправлена'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchTxInfo()}
                disabled={loadingTxInfo}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="Обновить информацию"
              >
                <RefreshCw className={`w-4 h-4 ${loadingTxInfo ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => copyToClipboard(txHash)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title="Копировать хеш"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Хеш транзакции</label>
              <code className="block px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
                {txHash}
              </code>
            </div>

            {txInfo && (
              <>
                {txInfo.blockNumber && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Номер блока</label>
                      <div className="text-sm text-white font-mono">
                        {parseInt(txInfo.blockNumber, 16).toLocaleString()}
                      </div>
                    </div>
                    {txInfo.gasUsed && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Gas Used</label>
                        <div className="text-sm text-white font-mono">
                          {parseInt(txInfo.gasUsed, 16).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {txInfo.from && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">От</label>
                    <code className="block px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
                      {txInfo.from}
                    </code>
                  </div>
                )}

                {txInfo.to && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">К</label>
                    <code className="block px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
                      {txInfo.to}
                    </code>
                  </div>
                )}

                {txInfo.value && parseInt(txInfo.value, 16) > 0 && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Значение</label>
                    <div className="text-sm text-white font-mono">
                      {parseInt(txInfo.value, 16).toLocaleString()} wei
                      {' '}
                      ({(parseInt(txInfo.value, 16) / 1e18).toFixed(6)} ETH)
                    </div>
                  </div>
                )}
              </>
            )}

            {!txInfo && loadingTxInfo && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка информации о транзакции...
              </div>
            )}

            {!txInfo && !loadingTxInfo && (
              <div className="text-sm text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Транзакция еще не найдена в блокчейне. Подождите несколько секунд и обновите.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

