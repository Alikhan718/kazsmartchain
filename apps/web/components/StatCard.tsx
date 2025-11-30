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
  blue: 'from-blue-50 via-blue-50/50 to-transparent dark:from-blue-500/15 dark:via-blue-600/5 dark:to-transparent',
  green: 'from-emerald-50 via-emerald-50/50 to-transparent dark:from-emerald-500/15 dark:via-emerald-600/5 dark:to-transparent',
  purple: 'from-purple-50 via-purple-50/50 to-transparent dark:from-purple-500/15 dark:via-purple-600/5 dark:to-transparent',
  orange: 'from-orange-50 via-orange-50/50 to-transparent dark:from-orange-500/15 dark:via-orange-600/5 dark:to-transparent',
  cyan: 'from-cyan-50 via-cyan-50/50 to-transparent dark:from-cyan-500/15 dark:via-cyan-600/5 dark:to-transparent',
  amber: 'from-amber-50 via-amber-50/50 to-transparent dark:from-amber-500/15 dark:via-amber-600/5 dark:to-transparent',
};

const borderClasses = {
  blue: 'border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/40',
  green: 'border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400/40',
  purple: 'border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40',
  orange: 'border-orange-200 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-400/40',
  cyan: 'border-cyan-200 dark:border-cyan-500/20 hover:border-cyan-300 dark:hover:border-cyan-400/40',
  amber: 'border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-400/40',
};

const iconBgClasses = {
  blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const glowClasses = {
  blue: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10',
  green: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-500/10',
  purple: 'hover:shadow-purple-200/50 dark:hover:shadow-purple-500/10',
  orange: 'hover:shadow-orange-200/50 dark:hover:shadow-orange-500/10',
  cyan: 'hover:shadow-cyan-200/50 dark:hover:shadow-cyan-500/10',
  amber: 'hover:shadow-amber-200/50 dark:hover:shadow-amber-500/10',
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 dark:from-white/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBgClasses[gradient]} transition-transform group-hover:scale-110 duration-300`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
              trend === 'up' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 
              trend === 'down' ? 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20' : 
              'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50'
            }`}>
              <span className="font-medium">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{title}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 animate-count">{value}</div>
        {hint && <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{hint}</div>}
      </div>
    </div>
  );
}

export default StatCard;
