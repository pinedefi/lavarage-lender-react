import React from 'react';
import { cn } from '@/utils/cn';

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  variant = 'primary',
  size = 'md',
  weight = 'semibold',
  as: Component = 'span',
  className,
  children,
  ...props
}) => {
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
