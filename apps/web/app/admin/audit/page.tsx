'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, User, Building2, Activity } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  organization: string;
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

export default function AuditPage() {
  // Mock data пока нет API endpoint для audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      // TODO: Implement real audit logs endpoint
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user: 'admin@bcc.kz',
          organization: 'Банк ЦентрКредит',
          action: 'CREATE_TOKEN_POOL',
          resource: 'Token Pool: KZT Stablecoin',
          status: 'success' as const,
          details: 'Created fungible token pool for KZT stablecoin',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'admin@kaznu.kz',
          organization: 'КазНУ имени Аль-Фараби',
          action: 'MINT_NFT',
          resource: 'NFT: Digital Diploma #1234',
          status: 'success' as const,
          details: 'Minted digital diploma NFT for student',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'admin@bcc.kz',
          organization: 'Банк ЦентрКредит',
          action: 'TRANSFER_TOKEN',
          resource: 'Transfer: 1000 KZT',
          status: 'success' as const,
          details: 'Transferred 1000 KZT tokens to merchant',
        },
      ];
    },
    refetchInterval: 10000,
  });

  const successCount = auditLogs.filter((log: AuditEvent) => log.status === 'success').length;
  const failedCount = auditLogs.filter((log: AuditEvent) => log.status === 'failed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          Audit Logs | Журнал аудита
        </h1>
        <p className="text-gray-400 mt-2">
          Complete audit trail of all system activities | Полный журнал всех действий в системе
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-8 w-8 text-blue-400" />
            <div className="text-3xl font-bold text-blue-400">
              {isLoading ? '...' : auditLogs.length}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white">Total Events</h3>
          <p className="text-xs text-gray-400">Всего событий</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-green-400" />
            <div className="text-3xl font-bold text-green-400">
              {isLoading ? '...' : successCount}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white">Successful</h3>
          <p className="text-xs text-gray-400">Успешных</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-red-400" />
            <div className="text-3xl font-bold text-red-400">
              {isLoading ? '...' : failedCount}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white">Failed</h3>
          <p className="text-xs text-gray-400">Неудачных</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="h-8 w-8 text-purple-400" />
            <div className="text-3xl font-bold text-purple-400">2</div>
          </div>
          <h3 className="text-sm font-semibold text-white">Organizations</h3>
          <p className="text-xs text-gray-400">Организаций</p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Recent Activity | Последняя активность</h2>
          <p className="text-sm text-gray-400 mt-1">Detailed log of all blockchain operations</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p>Loading audit logs...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {auditLogs.map((log: AuditEvent) => (
              <div key={log.id} className="p-6 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      <span className="text-sm font-mono text-gray-500">{log.id}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{log.action}</h3>
                    <p className="text-gray-300 mb-3">{log.resource}</p>
                    
                    {log.details && (
                      <p className="text-sm text-gray-400 mb-3">{log.details}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {log.user}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {log.organization}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

