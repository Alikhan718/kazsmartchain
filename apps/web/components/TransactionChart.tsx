'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp } from 'lucide-react';
import { API_BASE } from '../lib/env';

export default function TransactionChart() {
  // Fetch hourly transaction data
  const { data: transactions, isLoading: loadingHourly } = useQuery({
    queryKey: ['hourly-transactions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/transactions/hourly`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch token transactions to include in stats
  const { data: tokenTxData, isLoading: loadingTokens } = useQuery({
    queryKey: ['token-transactions-chart'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/tokens/transactions?limit=100`);
      const data = await res.json();
      return data?.transactions || [];
    },
    refetchInterval: 30000,
  });

  const isLoading = loadingHourly || loadingTokens;

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 backdrop-blur-sm animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-800 rounded"></div>
      </div>
    );
  }

  // Get token transactions count
  const tokenTransactions = Array.isArray(tokenTxData) ? tokenTxData : [];
  const tokenTxCount = tokenTransactions.length;

  // Group token transactions by hour for chart
  const tokenTxByHour: Record<string, number> = {};
  tokenTransactions.forEach((tx: any) => {
    if (tx.created) {
      const hour = new Date(tx.created).toISOString().slice(0, 13) + ':00:00.000Z';
      tokenTxByHour[hour] = (tokenTxByHour[hour] || 0) + 1;
    }
  });

  // Merge with regular transactions
  const regularData = Array.isArray(transactions) ? transactions : [];
  const mergedData = regularData.map((item: any) => ({
    ...item,
    count: (item.count || 0) + (tokenTxByHour[item.hour] || 0),
  }));

  // If no regular data, create from token transactions
  const data = mergedData.length > 0 ? mergedData : Object.entries(tokenTxByHour).map(([hour, count]) => ({
    hour,
    count,
  })).sort((a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime());

  const maxValue = Math.max(...data.map((d: any) => d.count || 0), 1);
  const regularTotal = regularData.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
  const total = regularTotal + tokenTxCount;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Transaction Activity / Активность транзакций
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last 24 hours</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{total}</div>
          <div className="text-xs text-gray-500">Total transactions</div>
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No transaction data yet
          </div>
        ) : (
          data.slice(0, 12).reverse().map((item: any, idx: number) => {
            const percentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
            const hour = new Date(item.hour).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs text-gray-400 w-12 text-right font-mono">
                  {hour}
                </div>
                <div className="flex-1 bg-gray-900/50 rounded-full h-8 overflow-hidden border border-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    {item.count > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {item.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
        <div>Updated every 30 seconds</div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Live data
        </div>
      </div>
    </div>
  );
}

