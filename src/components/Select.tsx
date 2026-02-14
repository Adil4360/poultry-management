import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder = "Select an option...", className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-white appearance-none cursor-pointer",
              "focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50",
              "transition-all duration-200 hover:border-gray-300",
              "pr-10",
              error && "border-red-400 focus:border-red-500 focus:ring-red-50",
              className
            )}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
