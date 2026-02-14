import { ReactNode } from 'react';
import { cn } from '../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'teal';
  subtitle?: string;
}

const colorConfig = {
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200',
    border: 'border-green-100',
    value: 'text-green-700',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200',
    border: 'border-blue-100',
    value: 'text-blue-700',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    icon: 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-amber-200',
    border: 'border-amber-100',
    value: 'text-amber-700',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    icon: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-200',
    border: 'border-red-100',
    value: 'text-red-700',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    icon: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-200',
    border: 'border-purple-100',
    value: 'text-purple-700',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    icon: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-200',
    border: 'border-teal-100',
    value: 'text-teal-700',
  },
};

export function StatCard({ title, value, icon, trend, color = 'green', subtitle }: StatCardProps) {
  const config = colorConfig[color];
  
  return (
    <div className={cn(
      "rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-fade-in",
      config.bg,
      config.border
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 truncate">{title}</p>
          <p className={cn("text-xl sm:text-2xl font-bold truncate", config.value)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs sm:text-sm font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              {trend.positive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-2.5 sm:p-3 rounded-xl flex-shrink-0 shadow-lg",
          config.icon
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
