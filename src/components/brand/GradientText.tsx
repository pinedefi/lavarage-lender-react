import React from 'react';
import { cn } from '@/utils/cn';

type GradientTextProps<T extends React.ElementType = 'span'> = {
  variant?: 'primary' | 'secondary' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

const GradientText = <T extends React.ElementType = 'span'>({
  variant = 'primary',
  size = 'md',
  weight = 'semibold',
  as,
  className,
  children,
  ...props
}: GradientTextProps<T>) => {
  const Component = as || 'span';

  const variants = {
    primary: 'bg-gradient-to-r from-lavarage-coral to-lavarage-red',
    secondary: 'bg-gradient-to-r from-lavarage-yellow to-lavarage-orange',
    subtle: 'bg-gradient-to-r from-lavarage-orange/80 to-lavarage-coral/80',
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent',
        variants[variant],
        sizes[size],
        weights[weight],
        'tracking-tight leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GradientText;
