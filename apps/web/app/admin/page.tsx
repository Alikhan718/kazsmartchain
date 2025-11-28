'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../../lib/env';
import { StatCard } from '../../components/StatCard';
import { ChartCard } from '../../components/ChartCard';
import { Network, Shield, Activity, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Fetch global network metrics
  const { data: networkMetrics, isLoading } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/network`);
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: validators } = useQuery({
    queryKey: ['validators'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/dashboard/validators`);
      const data = await response.json();
      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading network metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Superadmin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Global network monitoring | National Bank of Kazakhstan
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Network Healthy</span>
        </div>
      </div>

      {/* Network Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Besu Blockchain"
          value={networkMetrics?.besu?.blockHeight?.toLocaleString() || '...'}
          hint={`status: ${networkMetrics?.besu?.status || 'unknown'}`}
          icon={Network}
          trend={networkMetrics?.besu?.status === 'healthy' ? 'up' : 'neutral'}
          trendValue={networkMetrics?.besu?.status === 'healthy' ? 'Online' : 'Checking'}
          gradient="blue"
        />
        <StatCard
          title="Solana Network"
          value={networkMetrics?.solana?.slotHeight?.toLocaleString() || '...'}
          hint={`status: ${networkMetrics?.solana?.status || 'unknown'}`}
          icon={Activity}
          trend={networkMetrics?.solana?.status === 'healthy' ? 'up' : 'neutral'}
          trendValue={networkMetrics?.solana?.status === 'healthy' ? 'Online' : 'Checking'}
          gradient="purple"
        />
        <StatCard
          title="Organizations"
          value={networkMetrics?.organizations?.active || 0}
          hint={`total: ${networkMetrics?.organizations?.total || 0}`}
          icon={Building2}
          trend="up"
          trendValue={`+${networkMetrics?.organizations?.total || 0}`}
          gradient="green"
        />
        <StatCard
          title="Transactions (24h)"
          value={networkMetrics?.transactions?.last24h?.toLocaleString() || '0'}
          hint="across all organizations"
          icon={Activity}
          trend="up"
          trendValue="+15%"
          gradient="orange"
        />
      </div>

      {/* Validators Status */}
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Network Validators</h2>
              <p className="text-sm text-gray-400">
                {Array.isArray(validators) ? validators.filter((v: any) => v.status === 'active').length : 0} active validators
              </p>
            </div>
          </div>
          <Link
            href="/admin/validators"
            className="px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-colors"
          >
            Manage →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.isArray(validators) && validators.length > 0 ? (
            validators.map((validator: any) => (
              <div
                key={validator.id}
                className="p-4 rounded-lg border border-gray-800/50 bg-gray-900/50 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{validator.name}</div>
                    <div className="text-xs text-gray-400">{validator.location}</div>
                  </div>
                  {validator.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="text-green-400 font-medium">{validator.uptime}%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500">Blocks:</span>
                  <span className="text-blue-400 font-medium">{validator.blocksProduced}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No validators found</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Network Throughput" subtitle="Transactions per hour" type="bar" />
        <ChartCard title="Event Frequency" subtitle="Events per minute" type="line" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/organizations"
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="font-semibold text-lg text-white mb-2">Manage Organizations</div>
            <div className="text-sm text-gray-400">
              Approve, suspend, or configure organizations
            </div>
          </Link>

          <Link
            href="/admin/compliance"
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-red-500/10 to-red-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500/30 transition-colors">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="font-semibold text-lg text-white mb-2">Compliance Monitoring</div>
            <div className="text-sm text-gray-400">AML/CFT alerts and suspicious activities</div>
          </Link>

          <Link
            href="/admin/network"
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                <Network className="w-6 h-6" />
              </div>
            </div>
            <div className="font-semibold text-lg text-white mb-2">Network Configuration</div>
            <div className="text-sm text-gray-400">
              Validators, nodes, and network parameters
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

