import React from 'react';

interface LavarageLogoProps {
  variant?: 'horizontal' | 'mark' | 'stacked' | 'logotype';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
  priority?: boolean; // For important logos that should load first
}

const LavarageLogo: React.FC<LavarageLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showText = true, // Legacy prop, maintained for compatibility
  priority = false,
}) => {
  const sizeClasses = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-20',
  };

  // Asset mapping based on variant
  const getAssetPath = () => {
    switch (variant) {
      case 'horizontal':
        return '/Lavarage-Logo-Horizontal.png';
      case 'mark':
        return '/Lavarage-Logomark.png';
      case 'stacked':
        return '/Lavarage-Logo-Stacked.png';
      case 'logotype':
        return '/Lavarage-Logotype.png';
      default:
        return '/Lavarage-Logo-Horizontal.png';
    }
  };

  // Alt text based on variant
  const getAltText = () => {
    switch (variant) {
      case 'horizontal':
        return 'LAVARAGE - Professional DeFi Lending Platform';
      case 'mark':
        return 'LAVARAGE Logo Mark';
      case 'stacked':
        return 'LAVARAGE Logo Stacked';
      case 'logotype':
        return 'LAVARAGE Logotype';
      default:
        return 'LAVARAGE - DeFi Lending Platform';
    }
  };

  // Width constraints based on variant and size for better responsive behavior
  const getWidthClass = () => {
    if (variant === 'mark') {
      return sizeClasses[size]; // Square aspect ratio for mark
    }
    
    const widthMap = {
      xs: 'max-w-16',
      sm: 'max-w-24',
      md: 'max-w-32',
      lg: 'max-w-48',
      xl: 'max-w-64',
      '2xl': 'max-w-80',
    };
    
    return widthMap[size];
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={getAssetPath()}
        alt={getAltText()}
        className={`
          ${sizeClasses[size]} 
          ${getWidthClass()} 
          w-auto 
          object-contain 
          transition-all 
          duration-300 
          hover:scale-105 
          select-none
          ${variant === 'mark' ? 'aspect-square' : ''}
        `}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onError={(e) => {
          console.warn('LAVARAGE logo failed to load:', getAssetPath());
          // Fallback could be implemented here if needed
        }}
      />
    </div>
  );
};

export default LavarageLogo;
