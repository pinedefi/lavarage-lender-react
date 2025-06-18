import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gray' | 'lavarage';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      primary: 'bg-lavarage-subtle text-lavarage-red border border-lavarage-orange/30',
      success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100',
      error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      lavarage: 'badge-lavarage shadow-md',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-all duration-300',
          variants[variant],
          sizes[size],
          variant === 'lavarage' && 'hover:shadow-lg hover:scale-105',
          variant === 'primary' && 'hover:bg-lavarage-subtle/80',
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
