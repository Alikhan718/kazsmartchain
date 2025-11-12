import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
}

const gradientClasses = {
  blue: 'from-blue-500/20 to-blue-600/10',
  green: 'from-green-500/20 to-green-600/10',
  purple: 'from-purple-500/20 to-purple-600/10',
  orange: 'from-orange-500/20 to-orange-600/10',
};

const iconColors = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
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
    <div className={`relative p-6 rounded-xl border border-gray-800/50 bg-gradient-to-br ${gradientClasses[gradient]} glass card-hover overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-gray-800/50 ${Icon ? iconColors[gradient] : ''}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              trend === 'up' ? 'text-green-400 bg-green-500/10' : 
              trend === 'down' ? 'text-red-400 bg-red-500/10' : 
              'text-gray-400 bg-gray-800/50'
            }`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400 font-medium mb-2">{title}</div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {hint && <div className="text-xs text-gray-500 mt-2">{hint}</div>}
      </div>
    </div>
  );
}


