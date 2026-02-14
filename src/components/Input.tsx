import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconPosition = 'left', className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-white",
              "focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50",
              "placeholder:text-gray-400 transition-all duration-200",
              "hover:border-gray-300",
              icon && iconPosition === 'left' && "pl-10",
              icon && iconPosition === 'right' && "pr-10",
              error && "border-red-400 focus:border-red-500 focus:ring-red-50",
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
