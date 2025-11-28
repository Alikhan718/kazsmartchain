'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../lib/env';
import { StatCard } from '../components/StatCard';
import KSCTokenCard from '../components/KSCTokenCard';
import TransactionsTable from '../components/TransactionsTable';
import TransactionChart from '../components/TransactionChart';
import { Network, Users, FileText, Activity, Zap, Shield, TrendingUp, Coins, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  // Fetch real network metrics
  const { data: networkMetrics, isLoading } = useQuery({
    queryKey: ['network-metrics-home'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/network`);
      return response.json();
    },
    refetchInterval: 15000,
  });

  const { data: validators } = useQuery({
    queryKey: ['validators-count'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/validators`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
  });

  // Fetch token stats to include in transaction count
  const { data: tokenStats } = useQuery({
    queryKey: ['token-stats-home'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/tokens/stats`);
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Calculate total transactions including token transfers
  const regularTxCount = networkMetrics?.transactions?.last24h || 0;
  const tokenTxCount = tokenStats?.totalTransactions || 0;
  const totalTransactions = regularTxCount + tokenTxCount;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-main">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-400 text-lg ml-14">
              Мониторинг блокчейн сети KazSmartChain
            </p>
            <p className="text-gray-500 text-sm ml-14 mt-1">
              Besu • FireFly • KSC Tokens • Solana NFT
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && networkMetrics?.firefly?.status === 'healthy' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">FireFly Online</span>
              </div>
            )}
            {!isLoading && networkMetrics?.besu?.status === 'healthy' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 text-sm font-medium">Besu Online</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        <StatCard 
          title="Узлы сети" 
          value={isLoading ? '...' : (networkMetrics?.besu?.status === 'healthy' ? '12' : '...')}
          hint="connected nodes" 
          icon={Network}
          trend={networkMetrics?.besu?.status === 'healthy' ? 'up' : 'neutral'}
          trendValue={networkMetrics?.besu?.status === 'healthy' ? 'Online' : 'Checking'}
          gradient="cyan"
        />
        <StatCard 
          title="Валидаторы" 
          value={isLoading ? '...' : (Array.isArray(validators) ? validators.filter((v: any) => v.status === 'active').length.toString() : '0')}
          hint="QBFT consensus" 
          icon={Shield}
          trend="neutral"
          gradient="green"
        />
        <StatCard 
          title="Транзакции (24ч)" 
          value={isLoading ? '...' : totalTransactions.toLocaleString()}
          hint="включая токен переводы" 
          icon={Activity}
          trend={totalTransactions > 0 ? 'up' : 'neutral'}
          trendValue={tokenTxCount > 0 ? `${tokenTxCount} token tx` : ''}
          gradient="purple"
        />
        <StatCard 
          title="Организации" 
          value={isLoading ? '...' : (networkMetrics?.organizations?.active || '2')}
          hint="active participants" 
          icon={Users}
          trend="up"
          trendValue={`Total: ${networkMetrics?.organizations?.total || 2}`}
          gradient="amber"
        />
      </div>
      
      {/* Token and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-2">
        <KSCTokenCard />
        <TransactionChart />
      </div>

      {/* Transactions Table */}
      <div className="animate-fade-in-up stagger-3">
        <TransactionsTable limit={8} />
      </div>
      
      {/* Quick Access */}
      <div className="animate-fade-in-up stagger-4">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400" />
          Быстрый доступ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/orgs" 
            className="group relative p-6 rounded-2xl glass border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-semibold text-lg text-white mb-2 group-hover:text-gradient-cyan">Организации</div>
              <div className="text-sm text-gray-400">Управление доступом, контракты, токены и активы</div>
            </div>
          </Link>
          
          <Link 
            href="/tokens" 
            className="group relative p-6 rounded-2xl glass border border-amber-500/20 hover:border-amber-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-semibold text-lg text-white mb-2 group-hover:text-gradient-amber">Token Hub</div>
              <div className="text-sm text-gray-400">KSC токены, балансы, переводы и история транзакций</div>
            </div>
          </Link>
          
          <Link 
            href="/audit" 
            className="group relative p-6 rounded-2xl glass border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-semibold text-lg text-white mb-2 group-hover:text-gradient-purple">Журнал аудита</div>
              <div className="text-sm text-gray-400">Поиск событий, фильтрация и экспорт журналов</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
