import React, { useId } from 'react';
import { TrendingUp } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type?: 'bar' | 'line';
}

export function ChartCard({ title, subtitle, type = 'bar' }: ChartCardProps) {
  const bars = [8, 14, 6, 10, 16, 12, 9, 13, 7, 11, 15, 8];
  const maxHeight = Math.max(...bars);
  const gradientId = useId();
  
  return (
    <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-gray-900/80 to-gray-900/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-300 mb-1">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
      {type === 'bar' ? (
        <div className="h-32 flex items-end gap-1.5">
          {bars.map((h, i) => (
            <div 
              key={i} 
              className="flex-1 rounded-t transition-all duration-300 hover:opacity-80 group relative"
              style={{ height: `${(h / maxHeight) * 100}%` }}
            >
              <div className="w-full h-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t shadow-lg" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 whitespace-nowrap">
                {h}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 relative">
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`lineGradient-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={`url(#lineGradient-${gradientId})`}
              strokeWidth="2"
              points={bars.map((h, i) => `${(i / (bars.length - 1)) * 200},${100 - (h / maxHeight) * 80}`).join(' ')}
            />
          </svg>
        </div>
      )}
    </div>
  );
}


