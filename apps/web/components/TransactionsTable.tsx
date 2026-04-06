'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, Flame, Coins, Activity, Zap } from 'lucide-react';
import { useState } from 'react';

export default function TransactionsTable({ limit = 10 }: { limit?: number }) {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['ksc-transactions', page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/transactions?limit=${limit}&offset=${page * limit}`
      );
      return res.json();
    },
    refetchInterval: 15000,
  });

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'mint':
        return { 
          bg: 'from-emerald-50 to-emerald-50/50 dark:from-emerald-500/20 dark:to-emerald-600/5', 
          border: 'border-emerald-200 dark:border-emerald-500/30', 
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
          icon: Coins 
        };
      case 'burn':
        return { 
          bg: 'from-red-50 to-red-50/50 dark:from-red-500/20 dark:to-red-600/5', 
          border: 'border-red-200 dark:border-red-500/30', 
          text: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
          icon: Flame 
        };
      case 'transfer':
        return { 
          bg: 'from-blue-50 to-blue-50/50 dark:from-blue-500/20 dark:to-blue-600/5', 
          border: 'border-blue-200 dark:border-blue-500/30', 
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
          icon: ArrowUpRight 
        };
      default:
        return { 
          bg: 'from-gray-50 to-gray-50/50 dark:from-gray-500/20 dark:to-gray-600/5', 
          border: 'border-gray-200 dark:border-gray-500/30', 
          text: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
          icon: Activity 
        };
    }
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
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl glass-strong border border-gray-200 dark:border-gray-800/50 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-strong border border-gray-200 dark:border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Последние транзакции
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recent KSC Token Transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          {data?.total || 0} всего
        </div>
      </div>

      {/* Transactions List */}
      {data?.transactions?.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
            <Zap className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Транзакций пока нет</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Здесь появятся все операции с токенами</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800/50">
          {data?.transactions?.map((tx: any, idx: number) => {
            const styles = getTypeStyles(tx.type);
            const Icon = styles.icon;
            
            return (
              <div 
                key={tx.id || idx} 
                className="tx-row px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${styles.bg} border ${styles.border}`}>
                    <Icon className={`w-5 h-5 ${styles.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles.badge}`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(tx.created)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-600">От:</span>
                        <span className="text-gray-700 dark:text-gray-300">{tx.fromName}</span>
                        {tx.from !== 'Contract' && (
                          <span className="text-xs text-gray-500 dark:text-gray-600 font-mono-code">
                            ({tx.from.slice(0, 4)}...{tx.from.slice(-3)})
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 dark:text-gray-700">→</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-600">Кому:</span>
                        <span className="text-gray-700 dark:text-gray-300">{tx.toName}</span>
                        {tx.to !== 'Contract' && (
                          <span className="text-xs text-gray-500 dark:text-gray-600 font-mono-code">
                            ({tx.to.slice(0, 4)}...{tx.to.slice(-3)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${tx.type === 'burn' ? 'text-red-600 dark:text-red-400' : tx.type === 'mint' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {tx.type === 'burn' ? '-' : tx.type === 'mint' ? '+' : ''}{tx.value} <span className="text-sm text-gray-500 dark:text-gray-400">KSC</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data?.hasMore && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800/50 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 glass border border-gray-300 dark:border-gray-700/50 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Назад
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-500">
            Страница {page + 1} из {Math.ceil((data?.total || 0) / limit)}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data?.hasMore}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 glass border border-gray-300 dark:border-gray-700/50 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Далее →
          </button>
        </div>
      )}
    </div>
  );
}
