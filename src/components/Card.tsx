import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className, title, subtitle, action, icon, noPadding }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in",
      className
    )}>
      {(title || action) && (
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                  {icon}
                </div>
              )}
              <div>
                {title && <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {action}
          </div>
        </div>
      )}
      <div className={noPadding ? "" : "p-4 sm:p-5"}>
        {children}
      </div>
    </div>
  );
}
