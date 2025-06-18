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
          'bg-black/75 backdrop-blur-xl rounded-xl overflow-hidden',
          'p-2 space-y-1 min-w-[200px]',
          'shadow-lg border border-white/10',
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
          'text-sm font-medium transition-colors',
          destructive ? 'text-red-500 hover:bg-red-500/10' : 'text-white hover:bg-white/10',
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
