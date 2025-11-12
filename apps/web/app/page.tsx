import Link from 'next/link';
import { Logo } from '../components/Logo';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { Network, Users, FileText, Activity, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Панель управления
          </h1>
          <p className="text-gray-400 text-lg">Мониторинг Besu (через FireFly), управление приватными группами, активами и Solana NFT.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Узлы сети" 
          value="12" 
          hint="подключенных узлов" 
          icon={Network}
          trend="up"
          trendValue="+2"
          gradient="blue"
        />
        <StatCard 
          title="Валидаторы" 
          value="7" 
          hint="консенсус QBFT" 
          icon={Shield}
          trend="neutral"
          gradient="green"
        />
        <StatCard 
          title="Транзакции (24ч)" 
          value="1,247" 
          hint="публичные и приватные" 
          icon={Activity}
          trend="up"
          trendValue="+12%"
          gradient="purple"
        />
        <StatCard 
          title="Выпущено NFT" 
          value="342" 
          hint="всего создано" 
          icon={Zap}
          trend="up"
          trendValue="+8"
          gradient="orange"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Пропускная способность транзакций" subtitle="Последние 12 часов" type="bar" />
        <ChartCard title="Частота событий" subtitle="Событий в минуту" type="line" />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Быстрый доступ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/orgs" 
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-white mb-2">Организации</div>
            <div className="text-sm text-gray-400">Управление доступом, приватными группами, контрактами, токенами, активами, интеграцией Solana и релейными сервисами</div>
          </Link>
          
          <Link 
            href="/network" 
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-green-500/10 to-green-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                <Network className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-white mb-2">Сеть</div>
            <div className="text-sm text-gray-400">Мониторинг валидаторов, управление разрешениями, просмотр узлов и метрик сети</div>
          </Link>
          
          <Link 
            href="/audit" 
            className="group p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-white mb-2">Журнал аудита</div>
            <div className="text-sm text-gray-400">Поиск по тенанту, пользователю, типу события и экспорт журналов аудита</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

