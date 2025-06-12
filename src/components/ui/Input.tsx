import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'message';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', leftIcon, rightIcon, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      message: 'bg-[#F2F2F7] dark:bg-[#1C1C1E] border-none rounded-3xl py-3 px-4 text-base',
    };

    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'block w-full rounded-md shadow-sm transition-colors',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-0',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            variants[variant],
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;