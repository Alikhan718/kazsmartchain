'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, Shield, FileCode, Coins, Image, Zap, ArrowRight, Users, Lock, Wallet, TrendingUp, ExternalLink } from 'lucide-react';

const organizationsData = [
  { 
    id: 'nu', 
    name: 'Назарбаевский Университет',
    shortName: 'НУ',
    description: 'Образовательное учреждение',
    members: 15,
    status: 'active',
    address: '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
    color: 'cyan',
    icon: '🎓'
  },
  { 
    id: 'kaznu', 
    name: 'КазНУ им. Аль-Фараби',
    shortName: 'KazNU',
    description: 'Образовательное учреждение',
    members: 8,
    status: 'active',
    address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    color: 'purple',
    icon: '🎓'
  },
];

const orgLinks = [
  { href: 'access', label: 'Доступ', icon: Shield, color: 'cyan' },
  { href: 'privacy', label: 'Приватность', icon: Lock, color: 'emerald' },
  { href: 'contracts', label: 'Контракты', icon: FileCode, color: 'purple' },
  { href: 'tokens', label: 'Токены', icon: Coins, color: 'amber' },
  { href: 'assets', label: 'Активы', icon: Image, color: 'pink' },
  { href: 'solana', label: 'Solana', icon: Zap, color: 'orange' },
  { href: 'relay', label: 'Relay', icon: ArrowRight, color: 'sky' },
];

const colorClasses: Record<string, string> = {
  cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 hover:border-cyan-400/40',
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-400/40',
  purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 hover:border-purple-400/40',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 hover:border-amber-400/40',
  pink: 'from-pink-500/20 to-pink-600/5 text-pink-400 hover:bg-pink-500/20 border-pink-500/20 hover:border-pink-400/40',
  orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 hover:bg-orange-500/20 border-orange-500/20 hover:border-orange-400/40',
  sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 hover:bg-sky-500/20 border-sky-500/20 hover:border-sky-400/40',
};

const orgColorClasses: Record<string, { bg: string, border: string, text: string, glow: string }> = {
  cyan: {
    bg: 'from-cyan-500/10 via-cyan-600/5 to-transparent',
    border: 'border-cyan-500/30 hover:border-cyan-400/50',
    text: 'text-cyan-400',
    glow: 'hover:shadow-cyan-500/20'
  },
  purple: {
    bg: 'from-purple-500/10 via-purple-600/5 to-transparent',
    border: 'border-purple-500/30 hover:border-purple-400/50',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-500/20'
  },
};

export default function Orgs() {
  // Fetch real-time balances
  const { data: balances, isLoading } = useQuery({
    queryKey: ['ksc-balances'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/balances`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const getOrgBalance = (slug: string) => {
    if (!balances?.balances) return null;
    return balances.balances.find((b: any) => b.slug === slug);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200 dark:border-blue-500/20">
            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-main">
            Organizations
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg ml-14">
          Управление организациями, доступом и блокчейн-ресурсами
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="p-5 rounded-2xl glass border border-gray-200 dark:border-gray-800/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{organizationsData.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Активных организаций</div>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-gray-200 dark:border-gray-800/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : balances?.totalSupply || '0'} <span className="text-lg text-gray-500 dark:text-gray-400">KSC</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Общий баланс токенов</div>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-gray-200 dark:border-gray-800/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {organizationsData.reduce((sum, org) => sum + org.members, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Всего участников</div>
          </div>
        </div>
      </div>
      
      {/* Organizations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {organizationsData.map((org, idx) => {
          const balance = getOrgBalance(org.id);
          const colors = orgColorClasses[org.color];
          
          return (
            <div 
              key={org.id} 
              className={`animate-fade-in-up stagger-${idx + 2} group relative p-6 rounded-2xl glass-strong card-hover bg-gradient-to-br ${colors.bg} ${colors.border} hover:shadow-2xl ${colors.glow} transition-all duration-500`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Header */}
              <div className="relative flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl p-3 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
                    {org.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gradient-main transition-all">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      {org.description}
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        ● активна
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Balance Card */}
              <div className="relative mb-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 dark:from-blue-500/5 via-transparent to-purple-50/50 dark:to-purple-500/5" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg.replace('to-transparent', 'to-gray-50 dark:to-gray-900')} ${colors.text}`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">KSC Token Balance</div>
                      {isLoading ? (
                        <div className="h-7 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${colors.text} animate-count`}>
                            {balance?.balance || '0'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">KSC</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {balance && balances?.totalSupplyRaw && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Доля в сети</div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${colors.text === 'text-blue-600 dark:text-blue-400' || colors.text === 'text-cyan-400' ? 'from-blue-500 to-blue-400' : 'from-purple-500 to-purple-400'}`}
                            style={{ width: `${Math.min(100, (balance.balanceRaw / balances.totalSupplyRaw) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {((balance.balanceRaw / balances.totalSupplyRaw) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Wallet address */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono-code">
                      {org.address.slice(0, 10)}...{org.address.slice(-8)}
                    </div>
                    <Link
                      href={`/orgs/${org.id}/tokens`}
                      className={`flex items-center gap-1 text-xs ${colors.text} hover:underline`}
                    >
                      Управление токенами
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Members count */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{org.members} участников</span>
                </div>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(5, org.members))].map((_, i) => (
                    <div 
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  {org.members > 5 && (
                    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                      +{org.members - 5}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {orgLinks.map((link) => {
                  const Icon = link.icon;
                  const isTokens = link.href === 'tokens';
                  return (
                    <Link
                      key={link.href}
                      href={`/orgs/${org.id}/${link.href}`}
                      prefetch={false}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-br ${colorClasses[link.color]} transition-all duration-300 hover:scale-105 group/link ${isTokens ? 'ring-1 ring-amber-500/30' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium text-center">{link.label}</span>
                      {isTokens && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Transfer CTA */}
      <div className="animate-fade-in-up stagger-4 p-6 rounded-2xl glass-strong border border-gray-200 dark:border-gray-800/50 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Быстрый перевод KSC токенов</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Переводите токены между организациями в один клик</p>
            </div>
          </div>
          <Link
            href="/tokens"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-500/20 btn-shine"
          >
            <Coins className="w-5 h-5" />
            Открыть Token Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
