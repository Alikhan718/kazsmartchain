'use client';

import { useQuery } from '@tanstack/react-query';
import { Shield, Activity, MapPin, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Validator {
  id: string;
  name: string;
  organization: string;
  location: string;
  status: 'active' | 'inactive' | 'warning';
  uptime: number;
  blocksProduced: number;
  address: string;
}

export default function ValidatorsPage() {
  const { data: validators = [], isLoading } = useQuery({
    queryKey: ['validators'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/validators`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  const activeCount = validators.filter((v: Validator) => v.status === 'active').length;
  const avgUptime = validators.length > 0
    ? validators.reduce((sum: number, v: Validator) => sum + v.uptime, 0) / validators.length
    : 0;
  const totalBlocks = validators.reduce((sum: number, v: Validator) => sum + v.blocksProduced, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'inactive':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'inactive':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Validators Management | Управление валидаторами
        </h1>
        <p className="text-gray-400 mt-2">
          Monitor and manage QBFT consensus validators | Мониторинг и управление QBFT валидаторами
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">
                {isLoading ? '...' : activeCount}
              </div>
              <div className="text-sm text-gray-400">of {validators.length} total</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white">Active Validators</h3>
          <p className="text-sm text-gray-400">Активные валидаторы</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-green-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">
                {isLoading ? '...' : avgUptime.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">average</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white">Network Uptime</h3>
          <p className="text-sm text-gray-400">Аптайм сети</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">
                {isLoading ? '...' : totalBlocks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">blocks</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white">Total Blocks Produced</h3>
          <p className="text-sm text-gray-400">Всего блоков произведено</p>
        </div>
      </div>

      {/* Validators List */}
      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Validator Nodes | Узлы валидаторов</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time status of all validator nodes in the network</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p>Loading validators...</p>
          </div>
        ) : validators.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No validators found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Validator | Валидатор
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Organization | Организация
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location | Локация
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Blocks Produced
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {validators.map((validator: Validator) => (
                  <tr key={validator.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(validator.status)}`}>
                        {getStatusIcon(validator.status)}
                        <span className="text-sm font-medium capitalize">{validator.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{validator.name}</div>
                          <div className="text-xs text-gray-400">{validator.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{validator.organization}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {validator.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              validator.uptime >= 99 ? 'bg-green-500' :
                              validator.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${validator.uptime}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-12">
                          {validator.uptime.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white">
                        {validator.blocksProduced.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 font-mono">
                        {validator.address.slice(0, 6)}...{validator.address.slice(-4)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

