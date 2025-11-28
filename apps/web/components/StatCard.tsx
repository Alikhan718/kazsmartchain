import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'amber';
}

const gradientClasses = {
  blue: 'from-blue-500/15 via-blue-600/5 to-transparent',
  green: 'from-emerald-500/15 via-emerald-600/5 to-transparent',
  purple: 'from-purple-500/15 via-purple-600/5 to-transparent',
  orange: 'from-orange-500/15 via-orange-600/5 to-transparent',
  cyan: 'from-cyan-500/15 via-cyan-600/5 to-transparent',
  amber: 'from-amber-500/15 via-amber-600/5 to-transparent',
};

const borderClasses = {
  blue: 'border-blue-500/20 hover:border-blue-400/40',
  green: 'border-emerald-500/20 hover:border-emerald-400/40',
  purple: 'border-purple-500/20 hover:border-purple-400/40',
  orange: 'border-orange-500/20 hover:border-orange-400/40',
  cyan: 'border-cyan-500/20 hover:border-cyan-400/40',
  amber: 'border-amber-500/20 hover:border-amber-400/40',
};

const iconBgClasses = {
  blue: 'bg-blue-500/10 text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-400',
  orange: 'bg-orange-500/10 text-orange-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  amber: 'bg-amber-500/10 text-amber-400',
};

const glowClasses = {
  blue: 'hover:shadow-blue-500/10',
  green: 'hover:shadow-emerald-500/10',
  purple: 'hover:shadow-purple-500/10',
  orange: 'hover:shadow-orange-500/10',
  cyan: 'hover:shadow-cyan-500/10',
  amber: 'hover:shadow-amber-500/10',
};

export function StatCard({ 
  title, 
  value, 
  hint, 
  icon: Icon,
  trend,
  trendValue,
  gradient = 'blue'
}: StatCardProps) {
  return (
    <div className={`group relative p-6 rounded-2xl glass border ${borderClasses[gradient]} bg-gradient-to-br ${gradientClasses[gradient]} card-hover overflow-hidden hover:shadow-xl ${glowClasses[gradient]} transition-all duration-500`}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBgClasses[gradient]} transition-transform group-hover:scale-110 duration-300`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
              trend === 'up' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 
              trend === 'down' ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 
              'text-gray-400 bg-gray-800/50 border border-gray-700/50'
            }`}>
              <span className="font-medium">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400 font-medium mb-2">{title}</div>
        <div className="text-3xl font-bold text-white mb-1 animate-count">{value}</div>
        {hint && <div className="text-xs text-gray-500 mt-2">{hint}</div>}
      </div>
    </div>
  );
}

export default StatCard;
