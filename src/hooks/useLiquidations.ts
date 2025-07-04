import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { LiquidationData, LiquidationSearchParams } from '@/types';
import { useError } from '@/contexts/ErrorContext';

interface UseLiquidationsReturn {
  liquidations: LiquidationData[];
  loading: boolean;
  error: string | null;
  dateRange: {
    gte: string;
    lte: string;
  };
  setDateRange: (range: { gte: string; lte: string }) => void;
  refresh: () => void;
}

export const useLiquidations = (): UseLiquidationsReturn => {
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useError();
  const [dateRange, setDateRange] = useState(() => {
    const now = Math.floor(Date.now() / 1000);
    const fiveDaysAgo = now - (5 * 24 * 60 * 60);
    return {
      gte: fiveDaysAgo.toString(),
      lte: now.toString(),
    };
  });

  const fetchLiquidations = useCallback(async (params: LiquidationSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.searchLiquidations(params);
      setLiquidations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch liquidations';
      setError(errorMessage);
      setLiquidations([]);
      
      // Handle LavaRock NFT errors globally first
      handleError(errorMessage);
      
      // Note: This hook doesn't show toasts by default, but the error will be displayed in the UI
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const refresh = useCallback(() => {
    fetchLiquidations(dateRange);
  }, [fetchLiquidations, dateRange]);

  const handleSetDateRange = useCallback((range: { gte: string; lte: string }) => {
    setDateRange(range);
  }, []);

  useEffect(() => {
    fetchLiquidations(dateRange);
  }, [fetchLiquidations, dateRange]);

  return {
    liquidations,
    loading,
    error,
    dateRange,
    setDateRange: handleSetDateRange,
    refresh,
  };
}; 