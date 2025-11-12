'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE, getDevToken } from '../../../../lib/env';
import { FileCode, Plus, Radio, CheckCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Contract {
  id: string;
  name: string;
  address?: string;
  abi: any[];
  createdAt: string;
}

interface Listener {
  id: string;
  name: string;
  topics: string[];
  createdAt: string;
}

export default function ContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [abi, setAbi] = useState('[]');
  const [eventName, setEventName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  // Mock данные контрактов
  const mockContracts: Contract[] = [
    { id: '1', name: 'ERC20Token', address: '0x1234...5678', abi: [], createdAt: new Date().toISOString() },
    { id: '2', name: 'CertificateRegistry', address: '0xabcd...ef01', abi: [], createdAt: new Date().toISOString() },
    { id: '3', name: 'PrivacyGroup', address: undefined, abi: [], createdAt: new Date().toISOString() },
  ];

  const mockListeners: Listener[] = [
    { id: '1', name: 'ERC20Token:Transfer', topics: ['Transfer'], createdAt: new Date().toISOString() },
    { id: '2', name: 'CertificateRegistry:Issue', topics: ['Issue'], createdAt: new Date().toISOString() },
  ];

  const { data: contracts, refetch: refetchContracts } = useQuery({
    queryKey: ['contracts', orgId],
    queryFn: async () => mockContracts,
    enabled: !!orgId,
  });

  const { data: listeners, refetch: refetchListeners } = useQuery({
    queryKey: ['listeners', orgId],
    queryFn: async () => mockListeners,
    enabled: !!orgId,
  });

  async function register() {
    if (!name) return;
    setBusy('register');
    setResult(null);
    try {
      const body = { name, address: address || undefined, abi: JSON.parse(abi) };
      const res = await fetch(`${API_BASE}/api/besu/firefly/${orgId}/contracts/interfaces`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      setResult(`Контракт "${name}" успешно зарегистрирован`);
      setName('');
      setAddress('');
      setAbi('[]');
      refetchContracts();
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`);
    } finally {
      setBusy(null);
    }
  }

  async function createListener() {
    if (!name || !eventName) return;
    setBusy('listener');
    setResult(null);
    try {
      const body = { name: `${name}:${eventName}`, topics: [eventName] };
      const res = await fetch(`${API_BASE}/api/besu/firefly/${orgId}/events/streams`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(orgId)}` },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      setResult(`Слушатель событий "${eventName}" создан`);
      setEventName('');
      refetchListeners();
    } catch (error: any) {
      setResult(`Ошибка: ${error.message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Смарт-контракты
        </h1>
        <p className="text-gray-400 text-lg">Управление смарт-контрактами и слушателями событий</p>
      </div>

      {/* Список контрактов */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <FileCode className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Зарегистрированные контракты</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts && contracts.length > 0 ? (
            contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{contract.name}</div>
                    {contract.address && (
                      <div className="text-xs text-gray-400 font-mono truncate">{contract.address}</div>
                    )}
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Зарегистрирован: {new Date(contract.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Контракты не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Слушатели событий */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Слушатели событий</h2>
        </div>
        <div className="space-y-3">
          {listeners && listeners.length > 0 ? (
            listeners.map((listener) => (
              <div
                key={listener.id}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-white mb-1">{listener.name}</div>
                  <div className="text-sm text-gray-400">
                    Темы: {listener.topics.join(', ')}
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Слушатели не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Формы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Зарегистрировать контракт</h2>
          </div>
          <div className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Название контракта"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Адрес (опционально)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <textarea
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm h-32"
              placeholder='ABI (JSON массив, например: [{"type":"function",...}])'
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
            />
            <button
              onClick={register}
              disabled={busy === 'register' || !name}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'register' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Регистрация...</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>Зарегистрировать</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Radio className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Создать слушатель событий</h2>
          </div>
          <div className="space-y-3">
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              placeholder="Название контракта"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              placeholder="Название события"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <button
              onClick={createListener}
              disabled={busy === 'listener' || !name || !eventName}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy === 'listener' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Создать слушатель</span>
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
    </div>
  );
}

