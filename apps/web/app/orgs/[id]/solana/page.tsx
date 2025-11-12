'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../lib/client';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { Zap, Plus, Edit, Ban, ExternalLink, Copy, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SolanaNFT {
  mint: string;
  uri: string;
  status: 'issued' | 'updated' | 'revoked';
  besuTxHash?: string;
}

export default function SolanaPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [uri, setUri] = useState('');
  const [updateMint, setUpdateMint] = useState('');
  const [updateUri, setUpdateUri] = useState('');
  const [revokeMint, setRevokeMint] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  // Mock список NFT (в реальности нужно добавить GET endpoint)
  const mockNFTs: SolanaNFT[] = [
    { mint: 'Mint1a2b3c4d', uri: 'ipfs://QmXxxx1', status: 'issued' },
    { mint: 'Mint5e6f7g8h', uri: 'ipfs://QmXxxx2', status: 'updated', besuTxHash: '0x1234...' },
    { mint: 'Mint9i0j1k2l', uri: 'ipfs://QmXxxx3', status: 'revoked' },
  ];

  const { data: nfts, refetch } = useQuery({
    queryKey: ['solana-nfts', orgId],
    queryFn: async () => {
      // В реальности здесь будет запрос к API для получения списка NFT
      // Пока используем mock данные
      return mockNFTs;
    },
    enabled: !!orgId,
  });

  async function mintNft(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) {
      setResult('Ошибка: ID организации не загружен');
      return;
    }
    setBusy('mint');
    setResult(null);
    try {
      const res = await createClient(orgId).solanaMint(orgId, uri);
      setResult(`NFT успешно создан! Mint: ${res.mint}`);
      setUri('');
      // Обновляем список NFT и даем время API обработать событие аудита
      setTimeout(() => refetch(), 500);
    } catch (error: any) {
      setResult(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Mint error:', error);
    } finally {
      setBusy(null);
    }
  }

  async function updateMetadata() {
    if (!updateMint || !updateUri) return;
    setBusy('update');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/solana/${orgId}/update`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify({ mint: updateMint, uri: updateUri }),
      }).then((r) => r.json());
      setResult(`Метаданные обновлены для ${updateMint}`);
      setUpdateMint('');
      setUpdateUri('');
      refetch();
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`);
    } finally {
      setBusy(null);
    }
  }

  async function revokeNft() {
    if (!revokeMint) return;
    setBusy('revoke');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/solana/${orgId}/revoke`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify({ mint: revokeMint }),
      }).then((r) => r.json());
      setResult(`NFT ${revokeMint} отозван`);
      setRevokeMint('');
      refetch();
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`);
    } finally {
      setBusy(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusColors = {
    issued: 'bg-green-500/10 text-green-400 border-green-500/20',
    updated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const statusLabels = {
    issued: 'Выпущен',
    updated: 'Обновлен',
    revoked: 'Отозван',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Solana NFT
        </h1>
        <p className="text-gray-400 text-lg">Управление NFT на блокчейне Solana</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mint NFT */}
        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Создать NFT</h2>
          </div>
          <form onSubmit={mintNft} className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              placeholder="ipfs://CID или URI"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy === 'mint' || !uri || !orgId}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'mint' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Создать NFT</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Update Metadata */}
        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Edit className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Обновить метаданные</h2>
          </div>
          <div className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Mint адрес"
              value={updateMint}
              onChange={(e) => setUpdateMint(e.target.value)}
            />
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Новый URI"
              value={updateUri}
              onChange={(e) => setUpdateUri(e.target.value)}
            />
            <button
              onClick={updateMetadata}
              disabled={busy === 'update' || !updateMint || !updateUri}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'update' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Обновление...</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Обновить</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Revoke NFT */}
        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-red-500/10 to-red-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <Ban className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Отозвать NFT</h2>
          </div>
          <div className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Mint адрес"
              value={revokeMint}
              onChange={(e) => setRevokeMint(e.target.value)}
            />
            <button
              onClick={revokeNft}
              disabled={busy === 'revoke' || !revokeMint}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'revoke' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отзыв...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Отозвать</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400">
          {result}
        </div>
      )}

      {/* Список NFT */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Список NFT</h2>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts && nfts.length > 0 ? (
            nfts.map((nft) => (
              <div
                key={nft.mint}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-gray-300 truncate mb-1">{nft.mint}</div>
                    <div className="text-xs text-gray-500 truncate">{nft.uri}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[nft.status]}`}>
                    {statusLabels[nft.status]}
                  </span>
                </div>
                {nft.besuTxHash && (
                  <div className="text-xs text-gray-500 mb-2 font-mono truncate">
                    Besu: {nft.besuTxHash}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => copyToClipboard(nft.mint)}
                    className="p-1.5 rounded bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    title="Копировать Mint"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {nft.uri.startsWith('ipfs://') && (
                    <a
                      href={`https://ipfs.io/ipfs/${nft.uri.replace('ipfs://', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="Открыть в IPFS"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>NFT не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

