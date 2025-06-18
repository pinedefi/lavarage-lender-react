import React from 'react';
import { cn } from '@/utils/cn';

interface QuickActionMenuProps {
  className?: string;
  children: React.ReactNode;
}

const QuickActionMenu = React.forwardRef<HTMLDivElement, QuickActionMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-900/90 backdrop-blur-xl rounded-xl overflow-hidden',
          'p-2 space-y-1 min-w-[200px]',
          'shadow-xl border border-lavarage-orange/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

interface QuickActionItemProps {
  className?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}

const QuickActionItem = React.forwardRef<HTMLButtonElement, QuickActionItemProps>(
  ({ className, icon, children, destructive = false, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'w-full flex items-center px-4 py-2.5 rounded-lg',
          'text-sm font-medium transition-all duration-200',
          destructive 
            ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
            : 'text-gray-100 hover:bg-white/10 hover:text-white',
          'hover:shadow-md hover:scale-105 transform',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </button>
    );
  }
);

QuickActionMenu.displayName = 'QuickActionMenu';
QuickActionItem.displayName = 'QuickActionItem';

export { QuickActionMenu, QuickActionItem }; 