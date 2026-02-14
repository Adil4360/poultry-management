import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 text-white shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300',
  secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-200',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:from-red-700 active:to-rose-800 text-white shadow-md shadow-red-200',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 text-white shadow-md shadow-emerald-200',
  outline: 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs sm:text-sm min-h-[36px] rounded-lg',
  md: 'px-4 sm:px-5 py-2.5 text-sm sm:text-base min-h-[44px] rounded-xl',
  lg: 'px-6 sm:px-8 py-3 text-base sm:text-lg min-h-[52px] rounded-xl',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  loading,
  fullWidth,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 justify-center touch-manipulation",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        !disabled && !loading && "hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
