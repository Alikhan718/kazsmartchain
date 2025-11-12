'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { Lock, Send, CheckCircle, Loader2, Copy } from 'lucide-react';

export default function PrivacyPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [to, setTo] = useState('0x0000000000000000000000000000000000000000');
  const [pg, setPg] = useState('pg1');
  const [hash, setHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  async function sendTx(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setHash(null);
    try {
      const res = await fetch(`${API_BASE}/api/besu/firefly/${orgId}/tx/private`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify({ to, privacyGroupId: pg, data: '0x' }),
      }).then((r) => r.json());
      setHash(res.besu_tx_hash || JSON.stringify(res));
    } catch (error: any) {
      setHash(`Ошибка: ${error.message}`);
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Адрес получателя</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ID приватной группы</label>
              <input
                className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                value={pg}
                onChange={(e) => setPg(e.target.value)}
                placeholder="pg1"
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

      {hash && (
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Хеш транзакции Besu</h3>
            </div>
            <button
              onClick={() => copyToClipboard(hash)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <code className="block px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
            {hash}
          </code>
        </div>
      )}
    </div>
  );
}

