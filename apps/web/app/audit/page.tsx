'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../../lib/client';
import { useUI } from '../../store/ui';
import { FileText, Search, RefreshCw, Filter, Download, Clock, User, Tag } from 'lucide-react';

export default function AuditPage() {
  const tenant = useUI((s) => s.selectedTenant);
  const [type, setType] = useState('');
  const [userId, setUserId] = useState('');
  
  // Автоматическое обновление каждые 5 секунд для демонстрации
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['audit', tenant, type, userId],
    queryFn: async () => {
      if (!tenant) {
        console.log('No tenant selected');
        return { events: [] };
      }
      try {
        console.log('Fetching audit for tenant:', tenant, 'type:', type, 'userId:', userId);
        const result = await createClient(tenant).listAudit(tenant, type || undefined, userId || undefined);
        console.log('Audit result:', result);
        return result;
      } catch (err: any) {
        console.error('Audit fetch error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response,
        });
        // Возвращаем пустой массив при ошибке вместо падения
        return { events: [] };
      }
    },
    refetchInterval: 5000, // Автообновление каждые 5 секунд
    enabled: !!tenant,
  });

  // Обновляем при изменении фильтров
  useEffect(() => {
    if (tenant) {
      refetch();
    }
  }, [type, userId, tenant, refetch]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Журнал аудита
            </h1>
            <p className="text-gray-400 text-lg">Поиск по тенанту, пользователю, типу события и экспорт журналов аудита</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Автообновление каждые 5 сек</span>
            </div>
            {tenant && (
              <div className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-800/50">
                Тенант: {tenant}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">Фильтры</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              placeholder="Тип события" 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
            />
          </div>
          <div className="flex-1 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              placeholder="ID пользователя" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                  <span>Обновить</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 mb-4">
          <p className="text-sm">Ошибка загрузки: {error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          <p className="text-xs text-red-300 mt-1">Проверьте, что API запущен и база данных инициализирована</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="p-12 rounded-xl border border-gray-800/50 glass bg-gray-900/50 text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Загрузка событий аудита...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800/50 glass bg-gray-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Время
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Тип
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Подписант
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.events && data.events.length > 0 ? (
                  data.events.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          e.eventType.startsWith('solana.') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          e.eventType.startsWith('tokens.') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          e.eventType.startsWith('besu.') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {e.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono text-xs">
                        {e.signer || <span className="text-gray-500">—</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-2">События аудита не найдены</p>
                      <div className="text-xs text-gray-500 space-y-2">
                        {tenant ? (
                          <>
                            <p>Для тенанта "{tenant}" события не найдены.</p>
                            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg text-left max-w-md mx-auto">
                              <p className="font-medium text-gray-300 mb-2">Как создать события для демо:</p>
                              <ul className="space-y-1 text-gray-400 list-disc list-inside">
                                <li>Создайте NFT в разделе <strong className="text-purple-400">Solana</strong></li>
                                <li>Создайте пул токенов в разделе <strong className="text-orange-400">Токены</strong></li>
                                <li>Отправьте приватную транзакцию в разделе <strong className="text-green-400">Приватность</strong></li>
                              </ul>
                              <p className="mt-2 text-gray-500 text-xs">События появятся здесь автоматически через несколько секунд</p>
                            </div>
                          </>
                        ) : (
                          <p>Выберите тенант в правом верхнем углу</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {data?.events && data.events.length > 0 && (
            <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Показано {data.events.length} {data.events.length === 1 ? 'событие' : data.events.length < 5 ? 'события' : 'событий'}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Экспорт
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

