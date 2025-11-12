'use client';
import React, { useState } from 'react';
import { StatCard } from '../../components/StatCard';
import { ChartCard } from '../../components/ChartCard';
import { API_BASE, getDevToken } from '../../lib/env';
import { useUI } from '../../store/ui';
import { Network, Shield, Clock, Activity, Plus, Minus, Send } from 'lucide-react';

export default function NetworkPage() {
  const tenant = useUI((s) => s.selectedTenant);
  const [address, setAddress] = useState('');
  const [resp, setResp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function call(path: string, body: any) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/network/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getDevToken(tenant)}` },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      setResp(JSON.stringify(res, null, 2));
    } catch (error) {
      setResp(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Управление сетью
        </h1>
        <p className="text-gray-400 text-lg">Мониторинг валидаторов, управление разрешениями, просмотр узлов и метрик сети</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Узлы сети" 
          value="12" 
          hint="подключенных узлов" 
          icon={Network}
          trend="up"
          trendValue="+2"
          gradient="blue"
        />
        <StatCard 
          title="Валидаторы" 
          value="7" 
          hint="консенсус QBFT" 
          icon={Shield}
          trend="neutral"
          gradient="green"
        />
        <StatCard 
          title="Время блока" 
          value="2.1с" 
          hint="среднее" 
          icon={Clock}
          trend="down"
          trendValue="-0.2с"
          gradient="purple"
        />
        <StatCard 
          title="Задержка финализации" 
          value="3 блока" 
          hint="текущая" 
          icon={Activity}
          trend="neutral"
          gradient="orange"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Время блока" subtitle="Последние 12 часов" type="line" />
        <ChartCard title="Количество узлов" subtitle="Подключенные узлы во времени" type="bar" />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Разрешения</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              call('permissioning/addAccount', { address }); 
            }} 
            className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <Plus className="w-5 h-5" />
              </div>
              <div className="font-semibold text-lg text-white">Добавить аккаунт</div>
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                placeholder="0x..." 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
              <button 
                type="submit"
                disabled={loading || !address}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </form>
          
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              call('permissioning/removeAccount', { address }); 
            }} 
            className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-red-500/10 to-red-600/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <Minus className="w-5 h-5" />
              </div>
              <div className="font-semibold text-lg text-white">Удалить аккаунт</div>
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50" 
                placeholder="0x..." 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
              <button 
                type="submit"
                disabled={loading || !address}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Удалить
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {resp && (
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gray-900/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Ответ</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96 p-4 rounded-lg bg-gray-950 border border-gray-800">
            {resp}
          </pre>
        </div>
      )}
    </div>
  );
}

