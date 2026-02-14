import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', icon }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className={cn(
        "relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-auto",
        "animate-slide-up sm:animate-fade-in",
        sizeClasses[size]
      )}>
        {/* Handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-green-100 rounded-xl text-green-600 flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center text-gray-500 hover:text-gray-700 hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 sm:p-6 pb-8 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
