import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD', decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number, decimals = 2): string {
  console.log(num, decimals);
  if (num === 0) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Helper function to format number with floor rounding
export const formatNumberFloor = (num: number, decimals: number = 3): string => {
  if (num === 0) return '0';
  const multiplier = Math.pow(10, decimals);
  const floored = Math.floor(num * multiplier) / multiplier;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(floored);
};

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Truncates a Solana address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Converts lamports to SOL
 */
export function lamportsToSol(lamports: number | string): number {
  const lamportValue = typeof lamports === 'string' ? parseInt(lamports, 16) : lamports;
  return lamportValue / 1e9;
}

/**
 * Converts SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

/**
 * Formats token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 9,
  displayDecimals: number = 4
): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const adjusted = amountNum / Math.pow(10, decimals);
  return formatNumber(adjusted, displayDecimals);
}

/**
 * Calculates time remaining until a timestamp
 */
export function getTimeRemaining(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

/**
 * Formats time remaining as a human-readable string
 */
export function formatTimeRemaining(targetDate: Date | string): string {
  const { days, hours, minutes } = getTimeRemaining(targetDate);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculates APY from APR
 */
export function aprToApy(apr: number, compoundingFrequency: number = 365): number {
  return Math.pow(1 + apr / 100 / compoundingFrequency, compoundingFrequency) - 1;
}

/**
 * Validates Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Basic validation - Solana addresses are base58 encoded and 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
}

/**
 * Gets risk level based on LTV ratio
 */
export function getRiskLevel(ltv: number): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  color: string;
  label: string;
} {
  if (ltv === 0) {
    return { level: 'none', color: 'text-gray-600', label: 'No Risk' };
  } else if (ltv < 0.6) {
    return { level: 'low', color: 'text-success-600', label: 'Low Risk' };
  } else if (ltv < 0.75) {
    return { level: 'medium', color: 'text-warning-600', label: 'Medium Risk' };
  } else if (ltv < 0.9) {
    return { level: 'high', color: 'text-error-600', label: 'High Risk' };
  } else {
    return { level: 'critical', color: 'text-error-700', label: 'Critical Risk' };
  }
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Formats date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'relative':
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Formats a number for input fields, handling floating-point precision issues
 */
export function formatNumberForInput(value: number, decimals: number = 2): string {
  if (isNaN(value) || !Number.isFinite(value) || value === null || value === undefined) return '';

  // Handle zero case
  if (value === 0) return '0';

  // Define minimum threshold to prevent scientific notation
  const minThreshold = Math.pow(10, -(decimals + 2));
  if (Math.abs(value) < minThreshold) {
    return '0';
  }

  // Round to specified decimal places to avoid floating-point precision issues
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(value * multiplier) / multiplier;

  // Use Number.prototype.toFixed() and ensure no scientific notation
  let result = rounded.toFixed(decimals);

  // Remove trailing zeros after decimal point, but keep at least one decimal place for percentages
  if (result.includes('.')) {
    result = result.replace(/\.?0+$/, '');
    // If we removed all decimal places, ensure we don't end with a decimal point
    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
  }

  return result;
}

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `${price.toFixed(4)}`;
  } else if (price >= 0.000001) {
    return `${price.toFixed(6)}`;
  } else if (isNaN(price)) {
    return '--';
  } else {
    // Count leading zeros after decimal point
    const leadingZeros = Math.abs(Math.floor(Math.log10(price))) - 1;
    const significantDigits = price * Math.pow(10, leadingZeros + 1);
    // Convert number to subscript
    const subscript = leadingZeros
      .toString()
      .split('')
      .map((d) => '₀₁₂₃₄₅₆₇₈₉'[parseInt(d)])
      .join('');
    return `0.0${subscript}${(Number(significantDigits.toFixed(4)) * 10000).toFixed(0)}`;
  }
};

export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) +
    ' ' +
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
  );
};
