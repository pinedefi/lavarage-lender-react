import React from 'react';
import LavarageLogo from './LavarageLogo';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLogo?: boolean;
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  showLogo = false,
  message,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const containerSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const logoSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'xl' as const,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center space-y-6 ${className}`}
    >
      <span className="sr-only">Loading…</span>

      {showLogo && (
        <div className="mb-2">
          <LavarageLogo variant="mark" size={logoSizeMap[size]} className="animate-pulse" />
        </div>
      )}

      <div className={`relative ${containerSizeClasses[size]}`}>
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-lavarage-orange/20 animate-spin`}
        >
          <div
            className={`${sizeClasses[size]} rounded-full border-t-2 border-lavarage-coral`}
          ></div>
        </div>

        {/* Inner ring */}
        <div
          className={`absolute inset-2 rounded-full border border-lavarage-yellow/30 animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>

      {message && <p className="text-sm text-gray-600 animate-pulse font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
