'use client';

import { useQuery } from '@tanstack/react-query';
import { Coins, TrendingUp, ArrowUpRight, Flame, Wallet, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

const organizationsData: Record<string, { icon: string; color: string }> = {
  'bcc': { icon: '🏦', color: 'cyan' },
  'kaznu': { icon: '🎓', color: 'purple' },
};

export default function KSCTokenCard() {
  const { data: balances, isLoading } = useQuery({
    queryKey: ['ksc-balances'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/tokens/balances');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['ksc-stats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/tokens/stats');
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="col-span-2 rounded-2xl glass-strong border border-gray-200 dark:border-gray-800/50 p-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3 mb-6"></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 relative rounded-2xl glass-strong border border-amber-200 dark:border-amber-500/20 overflow-hidden">
      {/* Background effects - more subtle */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-amber-100/50 dark:bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-orange-100/50 dark:bg-orange-500/10 rounded-full blur-[60px]" />
      </div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200 dark:border-amber-500/20">
              <Coins className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                KSC Token
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Live
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">KazSmartChain Native Token</p>
            </div>
          </div>
          <Link
            href="/tokens"
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Token Hub
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Total Supply</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{balances?.totalSupply || '0'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">KSC</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Transferred</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalTransferred || '0'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stats?.transferCount || 0} tx</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalTransactions || '0'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">total</div>
          </div>
        </div>

        {/* Organization Balances */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Балансы организаций
          </h4>
          <div className="space-y-2">
            {balances?.balances?.map((org: any, idx: number) => {
              const orgMeta = organizationsData[org.slug];
              const percentage = balances.totalSupplyRaw > 0 
                ? (org.balanceRaw / balances.totalSupplyRaw) * 100 
                : 0;
              const colorClass = orgMeta?.color === 'purple' ? 'purple' : 'cyan';
              const isCyan = colorClass === 'cyan';
              
              return (
                <Link
                  key={idx}
                  href={`/orgs/${org.slug}/tokens`}
                  className={`group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/50 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{orgMeta?.icon || '🏢'}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {org.organization}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono-code">
                        {org.address.slice(0, 8)}...{org.address.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isCyan ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      {org.balance} <span className="text-sm text-gray-500 dark:text-gray-400">KSC</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCyan ? 'bg-blue-500 dark:bg-blue-400' : 'bg-purple-500 dark:bg-purple-400'}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
          <div className="font-mono-code">
            Contract: {balances?.token?.address?.slice(0, 12)}...{balances?.token?.address?.slice(-8)}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Live updates
          </div>
        </div>
      </div>
    </div>
  );
}
