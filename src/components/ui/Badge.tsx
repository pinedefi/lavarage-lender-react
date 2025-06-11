import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100',
      success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100',
      error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
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
          'inline-flex items-center rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;