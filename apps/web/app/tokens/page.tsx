'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Coins, TrendingUp, ArrowUpRight, Flame, Zap, Users, Activity, Shield, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const organizationsData = {
  'nu': {
    name: 'Назарбаевский Университет',
    shortName: 'НУ',
    icon: '🎓',
    color: 'cyan',
  },
  'kaznu': {
    name: 'КазНУ им. Аль-Фараби',
    shortName: 'KazNU',
    icon: '🎓',
    color: 'purple',
  },
};

export default function TokensPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isRefetching } = useQuery({
    queryKey: ['ksc-stats'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/stats`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useQuery({
    queryKey: ['ksc-balances'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/balances`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useQuery({
    queryKey: ['ksc-transactions-all'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/transactions?limit=50`);
      return res.json();
    },
    refetchInterval: 15000,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchBalances();
    refetchTx();
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'mint':
        return { bg: 'from-emerald-50 to-emerald-50/50 dark:from-emerald-500/20 dark:to-emerald-600/5', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', icon: Coins };
      case 'burn':
        return { bg: 'from-red-50 to-red-50/50 dark:from-red-500/20 dark:to-red-600/5', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-600 dark:text-red-400', icon: Flame };
      case 'transfer':
        return { bg: 'from-blue-50 to-blue-50/50 dark:from-blue-500/20 dark:to-blue-600/5', border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', icon: ArrowUpRight };
      default:
        return { bg: 'from-gray-50 to-gray-50/50 dark:from-gray-500/20 dark:to-gray-600/5', border: 'border-gray-200 dark:border-gray-500/30', text: 'text-gray-600 dark:text-gray-400', icon: Activity };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 rounded-xl glass border border-gray-200 dark:border-gray-800/50 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200 dark:border-amber-500/20">
                <Coins className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-amber">
                KSC Token Hub
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1 ml-14">
              Центр управления токенами KazSmartChain
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-500/20 btn-shine"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Token Hero Card */}
      <div className="animate-fade-in-up stagger-1 relative p-8 rounded-3xl glass-strong border border-amber-200 dark:border-amber-500/20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/50 dark:bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-100/50 dark:bg-orange-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 animate-float">
                💎
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white dark:border-gray-900">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">KSC Token</h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  ERC-20
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">KazSmartChain Native Utility Token</p>
              {balances?.token?.address && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono-code text-gray-500 dark:text-gray-400">
                    {balances.token.address.slice(0, 16)}...{balances.token.address.slice(-8)}
                  </span>
                  <button 
                    onClick={() => copyAddress(balances.token.address)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {copiedAddress === balances.token.address ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50 min-w-[140px]">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Total Supply
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 animate-count">
                {statsLoading ? '...' : balances?.totalSupply || '0'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">KSC</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50 min-w-[140px]">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Holders
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-count">
                {statsLoading ? '...' : stats?.holders || '0'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">организаций</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50 min-w-[140px]">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Transactions
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 animate-count">
                {statsLoading ? '...' : stats?.totalTransactions || '0'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">всего</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        <div className="p-5 rounded-2xl glass border border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 dark:from-emerald-500/10 to-emerald-50/50 dark:to-emerald-600/5">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Minted</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {statsLoading ? '...' : stats?.totalMinted || '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats?.mintCount || 0} операций</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-blue-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 dark:from-blue-500/10 to-blue-50/50 dark:to-blue-600/5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Transferred</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statsLoading ? '...' : stats?.totalTransferred || '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats?.transferCount || 0} переводов</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-red-200 dark:border-red-500/20 bg-gradient-to-br from-red-50 dark:from-red-500/10 to-red-50/50 dark:to-red-600/5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Burned</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statsLoading ? '...' : stats?.totalBurned || '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats?.burnCount || 0} сжиганий</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 dark:from-purple-500/10 to-purple-50/50 dark:to-purple-600/5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Безопасность</span>
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">Verified</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">OpenZeppelin</div>
        </div>
      </div>

      {/* Organization Balances */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Балансы организаций
          </h2>
          <Link href="/orgs" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
            Все организации
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balancesLoading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl glass border border-gray-200 dark:border-gray-800/50 animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))
          ) : (
            balances?.balances?.map((org: any) => {
              const orgMeta = organizationsData[org.slug as keyof typeof organizationsData];
              const percentage = balances.totalSupplyRaw > 0 
                ? (org.balanceRaw / balances.totalSupplyRaw) * 100 
                : 0;
              const colorClass = orgMeta?.color === 'purple' ? 'purple' : 'blue';
              const isBlue = colorClass === 'blue';
              
              return (
                <Link
                  key={org.slug}
                  href={`/orgs/${org.slug}/tokens`}
                  className={`group relative p-6 rounded-2xl glass border ${isBlue ? 'border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/40' : 'border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40'} transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl ${isBlue ? 'hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10' : 'hover:shadow-purple-200/50 dark:hover:shadow-purple-500/10'} overflow-hidden`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${isBlue ? 'from-blue-50/50 dark:from-blue-500/5 to-transparent' : 'from-purple-50/50 dark:from-purple-500/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${isBlue ? 'from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-600/10' : 'from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-600/10'}`}>
                        {orgMeta?.icon || '🏢'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gradient-main">
                          {org.organization}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono-code">
                          {org.address.slice(0, 8)}...{org.address.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className={`w-5 h-5 ${isBlue ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
                    </div>
                  </div>
                  
                  <div className="relative flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Баланс</div>
                      <div className={`text-3xl font-bold ${isBlue ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                        {org.balance} <span className="text-lg text-gray-500 dark:text-gray-400">KSC</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Доля</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isBlue ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-purple-600 to-purple-400'}`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/50 flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Перейти к управлению →</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${isBlue ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'}`}>
                      Активно
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            История транзакций
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-500">
            {transactions?.total || 0} всего
          </span>
        </div>
        
        <div className="rounded-2xl glass-strong border border-gray-200 dark:border-gray-800/50 overflow-hidden">
          {txLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-800/50 animate-pulse">
                <Activity className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 mt-4">Загрузка транзакций...</p>
            </div>
          ) : transactions?.transactions?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Транзакций пока нет</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Здесь появятся все операции с токенами</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {transactions?.transactions?.slice(0, 15).map((tx: any, idx: number) => {
                const styles = getTypeStyles(tx.type);
                const Icon = styles.icon;
                
                return (
                  <div 
                    key={tx.id || idx}
                    className="tx-row p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${styles.bg} border ${styles.border}`}>
                        <Icon className={`w-5 h-5 ${styles.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles.border} ${styles.text} bg-gray-50 dark:bg-gray-900/50`}>
                            {tx.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(tx.created)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            <span className="text-gray-500 dark:text-gray-600">От:</span> {tx.fromName}
                          </span>
                          <span className="text-gray-400 dark:text-gray-700">→</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            <span className="text-gray-500 dark:text-gray-600">Кому:</span> {tx.toName}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${tx.type === 'burn' ? 'text-red-600 dark:text-red-400' : tx.type === 'mint' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {tx.type === 'burn' ? '-' : tx.type === 'mint' ? '+' : ''}{tx.value} KSC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {transactions?.hasMore && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800/50 text-center">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Показать больше транзакций
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
