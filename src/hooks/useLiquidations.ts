import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { LiquidationData, LiquidationSearchParams } from '@/types';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch liquidations');
      setLiquidations([]);
    } finally {
      setLoading(false);
    }
  }, []);

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