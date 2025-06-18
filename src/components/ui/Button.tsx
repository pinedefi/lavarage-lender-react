import * as React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'outline'
    | 'glass'
    | 'lavarage';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading,
      fullWidth,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      primary: 'bg-lavarage-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      ghost: 'hover:bg-lavarage-subtle hover:text-lavarage-red',
      link: 'text-lavarage-coral hover:text-lavarage-red hover:underline',
      outline:
        'border border-lavarage-orange/30 text-lavarage-red hover:bg-lavarage-subtle hover:border-lavarage-coral',
      glass: 'btn-glass',
      lavarage: 'btn-lavarage',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const Comp =
      asChild && React.isValidElement(children) ? React.Children.only(children).type : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          variant === 'glass' && 'focus-visible:ring-lavarage-coral/50',
          variant === 'lavarage' && 'focus-visible:ring-lavarage-coral/50',
          variant === 'primary' && 'focus-visible:ring-lavarage-coral/50',
          className
        )}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-live="polite"
        {...props}
      >
        {isLoading ? (
          <span className="loading-lavarage mr-2 h-4 w-4" role="presentation" aria-hidden="true" />
        ) : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export default Button;
