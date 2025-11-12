import Link from 'next/link';
import { Building2, Shield, FileCode, Coins, Image, Zap, ArrowRight, Users, Lock, FileText } from 'lucide-react';

const demoOrgs = [
  { 
    id: 'demo-bank', 
    name: 'Демо Банк',
    description: 'Финансовая организация',
    members: 45,
    status: 'active'
  },
  { 
    id: 'demo-uni', 
    name: 'Демо Университет',
    description: 'Образовательное учреждение',
    members: 120,
    status: 'active'
  },
];

const orgLinks = [
  { href: 'access', label: 'Доступ', icon: Shield, color: 'blue' },
  { href: 'privacy', label: 'Приватность', icon: Lock, color: 'green' },
  { href: 'contracts', label: 'Контракты', icon: FileCode, color: 'purple' },
  { href: 'tokens', label: 'Токены', icon: Coins, color: 'orange' },
  { href: 'assets', label: 'Активы', icon: Image, color: 'pink' },
  { href: 'solana', label: 'Solana', icon: Zap, color: 'yellow' },
  { href: 'relay', label: 'Relay', icon: ArrowRight, color: 'cyan' },
];

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 hover:bg-blue-500/20',
  green: 'from-green-500/20 to-green-600/10 text-green-400 hover:bg-green-500/20',
  purple: 'from-purple-500/20 to-purple-600/10 text-purple-400 hover:bg-purple-500/20',
  orange: 'from-orange-500/20 to-orange-600/10 text-orange-400 hover:bg-orange-500/20',
  pink: 'from-pink-500/20 to-pink-600/10 text-pink-400 hover:bg-pink-500/20',
  yellow: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400 hover:bg-yellow-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 hover:bg-cyan-500/20',
};

export default function Orgs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Organizations
        </h1>
        <p className="text-gray-400 text-lg">Manage organizations, access control, privacy groups, and blockchain resources</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {demoOrgs.map((org) => (
          <div 
            key={org.id} 
            className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-gray-900/80 to-gray-900/40"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{org.name}</h3>
                  <p className="text-sm text-gray-400">{org.description}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                активна
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{org.members} участников</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {orgLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={`/orgs/${org.id}/${link.href}`}
                    prefetch={false}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-800/50 bg-gradient-to-br ${colorClasses[link.color as keyof typeof colorClasses]} transition-all hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

