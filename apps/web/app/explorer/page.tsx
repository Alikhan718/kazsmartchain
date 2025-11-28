'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../../lib/env';
import { Search, Activity, Box, FileText, TrendingUp, ExternalLink, Coins, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch network stats
  const { data: networkMetrics } = useQuery({
    queryKey: ['public-network-metrics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/network`);
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['public-recent-transactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/transactions/recent?limit=10`);
      const data = await response.json();
      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  // Fetch KSC Token transactions
  const { data: kscTransactions } = useQuery({
    queryKey: ['ksc-token-transactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/tokens/transactions?limit=10`);
      const data = await response.json();
      return data?.transactions || [];
    },
    refetchInterval: 10000,
  });

  // Fetch KSC Token stats
  const { data: kscStats } = useQuery({
    queryKey: ['ksc-token-stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/tokens/stats`);
      return response.json();
    },
    refetchInterval: 15000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search logic
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-4">
          KazSmartChain Explorer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explore the Kazakhstan sovereign blockchain network
          <br />
          <span className="text-sm">Қазақстанның егемен блокчейн желісі</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction Hash, Block Number, Address..."
            className="w-full px-6 py-4 pr-12 rounded-xl border border-gray-700 bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Box className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-400">Besu Block Height</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {networkMetrics?.besu?.blockHeight?.toLocaleString() || '...'}
          </div>
          <div className="text-xs text-gray-500 mt-2">~3 sec block time</div>
        </div>

        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-400">Solana Slot</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {networkMetrics?.solana?.slotHeight?.toLocaleString() || '...'}
          </div>
          <div className="text-xs text-gray-500 mt-2">~400ms slot time</div>
        </div>

        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-400">KSC Token Transfers</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {kscStats?.totalTransactions?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{kscStats?.transferCount || 0} transfers</span>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-400">Organizations</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {networkMetrics?.organizations?.active || 0}
          </div>
          <div className="text-xs text-gray-500 mt-2">Active participants</div>
        </div>
      </div>

      {/* KSC Token Transfers */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-emerald-900/20 to-gray-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">KSC Token Transfers</h2>
              <p className="text-sm text-gray-400">Recent ERC-20 token transfers</p>
            </div>
          </div>
          <Link 
            href="/tokens" 
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {kscTransactions && kscTransactions.length > 0 ? (
            kscTransactions.map((tx: any, index: number) => (
              <div
                key={tx.id || index}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.type === 'mint' 
                          ? 'bg-green-500/20 text-green-400'
                          : tx.type === 'burn'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-sm font-mono text-gray-400 truncate">
                        {tx.txHash?.slice(0, 10)}...{tx.txHash?.slice(-6) || tx.id?.slice(0, 16)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="truncate max-w-[120px]">{tx.fromName || tx.from?.slice(0, 10)}</span>
                      <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{tx.toName || tx.to?.slice(0, 10)}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-500">
                        {tx.created ? new Date(tx.created).toLocaleTimeString('ru-RU') : ''}
                      </span>
                    </div>
                  </div>
                  <div className={`text-right font-mono font-medium ${
                    tx.type === 'mint' ? 'text-green-400' : tx.type === 'burn' ? 'text-red-400' : 'text-white'
                  }`}>
                    {tx.type === 'mint' ? '+' : tx.type === 'burn' ? '-' : ''}{tx.value} KSC
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No token transfers yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Latest Transactions</h2>
            <p className="text-sm text-gray-400">Public transactions on KazSmartChain</p>
          </div>
        </div>

        <div className="space-y-3">
          {recentTransactions && recentTransactions.length > 0 ? (
            recentTransactions.map((tx: any) => (
              <div
                key={tx.id}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-blue-400 truncate">
                        {tx.hash?.slice(0, 10)}...{tx.hash?.slice(-8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          tx.status === 'success'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>From: {tx.from?.slice(0, 8)}...</span>
                      <span>→</span>
                      <span>To: {tx.to?.slice(0, 8)}...</span>
                      <span>|</span>
                      <span>{new Date(tx.timestamp).toLocaleTimeString('ru-RU')}</span>
                    </div>
                  </div>
                  <Link
                    href={`/explorer/tx/${tx.hash}`}
                    className="ml-4 p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/explorer/verify"
          className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
          </div>
          <div className="font-semibold text-lg text-white mb-2">Verify Certificate</div>
          <div className="text-sm text-gray-400">
            Verify diplomas, licenses, and certificates
            <br />
            <span className="text-xs">Дипломдар мен сертификаттарды тексеру</span>
          </div>
        </Link>

        <Link
          href="/explorer/docs"
          className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="font-semibold text-lg text-white mb-2">Documentation</div>
          <div className="text-sm text-gray-400">
            API docs, tutorials, and guides for developers
          </div>
        </Link>

        <Link
          href="/explorer/stats"
          className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-purple-500/10 to-purple-600/5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="font-semibold text-lg text-white mb-2">Network Statistics</div>
          <div className="text-sm text-gray-400">
            Detailed charts and analytics of network activity
          </div>
        </Link>
      </div>
    </div>
  );
}

