'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, Flame, RefreshCw, Send, 
  Wallet, ArrowLeft, CheckCircle2, XCircle, Activity, Shield, Copy, Check,
  Sparkles, Zap, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const organizationsData = {
  'nu': {
    name: 'Назарбаевский Университет',
    shortName: 'НУ',
    description: 'Образовательное учреждение',
    address: '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
    icon: '🎓',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
  },
  'kaznu': {
    name: 'КазНУ им. Аль-Фараби',
    shortName: 'KazNU',
    description: 'Образовательное учреждение',
    address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    icon: '🎓',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
};

export default function TokensPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string>('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  const orgData = orgId ? organizationsData[orgId as keyof typeof organizationsData] : null;

  // Fetch KSC token balances
  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useQuery({
    queryKey: ['ksc-balances'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/tokens/balances');
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch organization's transactions
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useQuery({
    queryKey: ['org-transactions', orgId],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/tokens/transactions?limit=30');
      const data = await res.json();
      
      const orgAddress = orgData?.address.toLowerCase();
      return data.transactions.filter((tx: any) => 
        tx.from?.toLowerCase() === orgAddress || tx.to?.toLowerCase() === orgAddress
      );
    },
    enabled: !!orgId && !!orgData,
    refetchInterval: 15000,
  });

  const orgBalance = balances?.balances?.find(
    (b: any) => b.slug === orgId
  );

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: { toOrg: string; amount: number }) => {
      const res = await fetch('http://localhost:4000/api/tokens/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromOrg: orgId,
          toOrg: data.toOrg,
          amount: data.amount,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Transfer failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ksc-balances'] });
      queryClient.invalidateQueries({ queryKey: ['org-transactions', orgId] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowTransferForm(false);
        setTransferTo('');
        setTransferAmount('');
      }, 2500);
    },
  });

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTo || !transferAmount) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    if (orgBalance && parseFloat(orgBalance.balance) < amount) {
      return;
    }
    transferMutation.mutate({ toOrg: transferTo, amount });
  };

  const otherOrgs = Object.entries(organizationsData).filter(([id]) => id !== orgId);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'mint':
        return { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: Coins };
      case 'burn':
        return { bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', text: 'text-red-400', icon: Flame };
      case 'transfer':
        return { bg: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: ArrowUpRight };
      default:
        return { bg: 'from-gray-500/20 to-gray-600/5', border: 'border-gray-500/30', text: 'text-gray-400', icon: Activity };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const copyAddress = () => {
    if (orgData?.address) {
      navigator.clipboard.writeText(orgData.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  if (!orgData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-gray-800/50 mb-4">
            <XCircle className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">Организация не найдена</p>
          <Link href="/orgs" className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
            ← Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  const colorClasses = orgData.color === 'cyan' 
    ? { bg: 'from-cyan-500/10 to-blue-500/5', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' }
    : { bg: 'from-purple-500/10 to-pink-500/5', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            href="/orgs"
            className="p-3 rounded-xl glass border border-gray-800/50 hover:border-cyan-500/30 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex items-center gap-4">
            <div className={`text-5xl p-4 rounded-2xl bg-gradient-to-br ${colorClasses.bg} border ${colorClasses.border}`}>
              {orgData.icon}
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${orgData.color === 'cyan' ? 'text-gradient-cyan' : 'text-gradient-purple'}`}>
                {orgData.name}
              </h1>
              <p className="text-gray-400">{orgData.description} • KSC Token Management</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            refetchBalances();
            refetchTx();
          }}
          className="p-3 rounded-xl glass border border-gray-800/50 hover:border-cyan-500/30 transition-all"
        >
          <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Balance Hero Card */}
      <div className={`animate-fade-in-up stagger-1 relative p-8 rounded-3xl glass-strong border ${colorClasses.border} overflow-hidden`}>
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className={`absolute top-0 left-1/4 w-80 h-80 ${orgData.color === 'cyan' ? 'bg-cyan-500/10' : 'bg-purple-500/10'} rounded-full blur-[100px]`} />
          <div className={`absolute bottom-0 right-1/4 w-60 h-60 ${orgData.color === 'cyan' ? 'bg-blue-500/10' : 'bg-pink-500/10'} rounded-full blur-[100px]`} />
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Баланс KSC токенов</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono-code mt-1">
                    {orgData.address.slice(0, 14)}...{orgData.address.slice(-10)}
                    <button onClick={copyAddress} className="p-1 hover:bg-gray-800 rounded">
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {balancesLoading ? (
                <div className="h-16 w-48 bg-gray-800/50 rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-bold ${colorClasses.text} animate-count`}>
                    {orgBalance?.balance || '0'}
                  </span>
                  <span className="text-2xl text-gray-500">KSC</span>
                </div>
              )}
              
              {orgBalance && balances?.totalSupplyRaw > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-sm text-gray-500">Доля в общем supply:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${orgData.gradient} transition-all duration-1000`}
                        style={{ width: `${Math.min(100, (orgBalance.balanceRaw / balances.totalSupplyRaw) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-400">
                      {((orgBalance.balanceRaw / balances.totalSupplyRaw) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {orgBalance && parseFloat(orgBalance.balance) > 0 && !showTransferForm && (
                <button
                  onClick={() => setShowTransferForm(true)}
                  className={`px-8 py-4 rounded-xl bg-gradient-to-r ${orgData.gradient} hover:opacity-90 text-white font-semibold flex items-center gap-3 transition-all hover:shadow-lg ${colorClasses.glow} btn-shine`}
                >
                  <Send className="w-5 h-5" />
                  Перевести токены
                </button>
              )}
              <Link
                href="/tokens"
                className="px-6 py-4 rounded-xl glass border border-gray-700/50 hover:border-cyan-500/30 text-gray-300 font-medium flex items-center gap-2 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Token Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <div className={`animate-fade-in-up relative p-8 rounded-3xl glass-strong border ${showSuccess ? 'border-emerald-500/50' : 'border-purple-500/30'} overflow-hidden transition-all duration-500`}>
          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in-up">
              <div className="text-center">
                <div className="inline-block p-4 rounded-full bg-emerald-500/20 mb-4 animate-success">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">Перевод выполнен!</h3>
                <p className="text-gray-400">Транзакция успешно отправлена в блокчейн</p>
              </div>
            </div>
          )}
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Перевод токенов</h2>
                <p className="text-gray-400">Отправьте KSC токены другой организации</p>
              </div>
            </div>
            
            <form onSubmit={handleTransfer} className="space-y-6">
              {/* From -> To Visual */}
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-gray-900/50 border border-gray-800/50">
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                  <div className="text-xs text-gray-500 mb-2">От</div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{orgData.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{orgData.shortName}</div>
                      <div className="text-xs text-gray-500">{orgBalance?.balance || '0'} KSC</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 p-3 rounded-full bg-purple-500/20 text-purple-400">
                  <ArrowRight className="w-6 h-6" />
                </div>
                
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                  <div className="text-xs text-gray-500 mb-2">Кому</div>
                  {transferTo ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {organizationsData[transferTo as keyof typeof organizationsData]?.icon}
                      </span>
                      <div>
                        <div className="font-semibold text-white">
                          {organizationsData[transferTo as keyof typeof organizationsData]?.shortName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {organizationsData[transferTo as keyof typeof organizationsData]?.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Выберите получателя</div>
                  )}
                </div>
              </div>
              
              {/* Organization selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">Выберите организацию получатель</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherOrgs.map(([id, org]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTransferTo(id)}
                      className={`p-4 rounded-xl border transition-all ${
                        transferTo === id 
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                          : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{org.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-white">{org.name}</div>
                          <div className="text-xs text-gray-500">{org.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Amount input */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">Сумма перевода</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={orgBalance?.balance || 0}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-gray-900/50 border border-gray-800 text-white text-2xl font-bold focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <span className="text-xl text-gray-500">KSC</span>
                    <button
                      type="button"
                      onClick={() => setTransferAmount(orgBalance?.balance || '0')}
                      className="px-3 py-1 rounded-lg bg-gray-800 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-500">Доступно: {orgBalance?.balance || '0'} KSC</span>
                  {transferAmount && parseFloat(transferAmount) > 0 && (
                    <span className="text-purple-400">
                      ≈ {parseFloat(transferAmount).toLocaleString('ru-RU')} KSC
                    </span>
                  )}
                </div>
              </div>
              
              {/* Error message */}
              {transferMutation.isError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="text-red-400">
                    {transferMutation.error instanceof Error ? transferMutation.error.message : 'Ошибка перевода'}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={transferMutation.isPending || !transferTo || !transferAmount}
                  className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {transferMutation.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Отправить перевод
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferForm(false);
                    setTransferTo('');
                    setTransferAmount('');
                    transferMutation.reset();
                  }}
                  className="px-8 py-4 rounded-xl glass border border-gray-700/50 hover:border-gray-600 text-gray-300 font-medium transition-all"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        <div className="p-5 rounded-2xl glass border border-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-gray-400">Total Supply</span>
          </div>
          <div className="text-2xl font-bold text-white">{balances?.totalSupply || '0'}</div>
          <div className="text-xs text-gray-500">KSC в сети</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">Транзакции</span>
          </div>
          <div className="text-2xl font-bold text-white">{transactions?.length || 0}</div>
          <div className="text-xs text-gray-500">с участием орг.</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Контракт</span>
          </div>
          <div className="text-sm font-mono-code text-white truncate">
            {balances?.token?.address?.slice(0, 10)}...
          </div>
          <div className="text-xs text-gray-500">KSC Token</div>
        </div>
        
        <div className="p-5 rounded-2xl glass border border-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-gray-400">Статус</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-medium text-emerald-400">Активен</span>
          </div>
          <div className="text-xs text-gray-500">ERC-20</div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className={colorClasses.text} />
            История транзакций
          </h2>
          <span className="text-sm text-gray-500">{transactions?.length || 0} транзакций</span>
        </div>
        
        <div className="rounded-2xl glass-strong border border-gray-800/50 overflow-hidden">
          {txLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Загрузка транзакций...</p>
            </div>
          ) : transactions?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-800/50 mb-4">
                <Zap className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">Транзакций пока нет</p>
              <p className="text-gray-500 text-sm mt-1">Начните с перевода токенов</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {transactions?.map((tx: any, idx: number) => {
                const isReceiving = tx.to?.toLowerCase() === orgData.address.toLowerCase();
                const isSending = tx.from?.toLowerCase() === orgData.address.toLowerCase();
                const styles = getTypeStyles(tx.type);
                const Icon = styles.icon;

                return (
                  <div
                    key={idx}
                    className="tx-row p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${styles.bg} border ${styles.border}`}>
                        <Icon className={`w-5 h-5 ${styles.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles.border} ${styles.text} bg-gray-900/50`}>
                            {tx.type}
                          </span>
                          {isReceiving && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                              <ArrowDownLeft className="w-3 h-3 inline mr-1" />
                              Получено
                            </span>
                          )}
                          {isSending && tx.type === 'transfer' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-amber-500/30 text-amber-400 bg-amber-500/10">
                              <ArrowUpRight className="w-3 h-3 inline mr-1" />
                              Отправлено
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            <span className="text-gray-600">От:</span> {tx.fromName}
                          </span>
                          <span className="text-gray-700">→</span>
                          <span className="text-gray-400">
                            <span className="text-gray-600">Кому:</span> {tx.toName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(tx.created)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isReceiving ? 'text-emerald-400' : isSending && tx.type === 'transfer' ? 'text-amber-400' : styles.text}`}>
                        {isReceiving ? '+' : isSending && tx.type === 'transfer' ? '-' : ''}{tx.value} KSC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
