import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, fullWidth, asChild = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      ghost: 'hover:bg-gray-100 hover:text-gray-900',
      link: 'text-primary-600 hover:underline',
      outline: 'border border-gray-300 hover:bg-gray-50',
      glass: 'btn-glass',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const Comp = asChild && React.isValidElement(children) ? 
      React.Children.only(children).type : 
      'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-white" />
        ) : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export default Button;