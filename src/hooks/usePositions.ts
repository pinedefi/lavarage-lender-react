import { useState, useEffect, useCallback } from 'react';
import { PositionV3Model } from '@/types';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import { useError } from '@/contexts/ErrorContext';
import toast from 'react-hot-toast';

interface UsePositionsOptions {
  status?: 'open' | 'closed' | 'liquidated' | 'all';
  includeInactionable?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePositionsReturn {
  positions: PositionV3Model[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    totalPositions: number;
    activePositions: number;
    totalBorrowed: number;
    totalInterestEarned: Record<string, number>;
    averageLTV: number;
  };
}

export function usePositions(options: UsePositionsOptions = {}): UsePositionsReturn {
  const [positions, setPositions] = useState<PositionV3Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, connected } = useWallet();
  const { handleError } = useError();

  const {
    status = 'all',
    includeInactionable = false,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const fetchPositions = useCallback(
    async (isInitialLoad = false) => {
      if (!connected || !publicKey) {
        setPositions([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await apiService.getLenderPositions({
          lenderWallet: publicKey.toBase58(),
          status,
          includeInactionable,
        });

        // Only update state if data has actually changed or it's the initial load
        setPositions((prevPositions) => {
          if (isInitialLoad || JSON.stringify(prevPositions) !== JSON.stringify(data)) {
            return data;
          }
          return prevPositions;
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch positions';
        setError(errorMessage);
        console.error('Error fetching positions:', err);

        // Silently handle timeout errors for background refresh
        if (!errorMessage.toLowerCase().includes('timeout')) {
          handleError(errorMessage);
          toast.error(errorMessage);
        } else {
          console.log('Background positions timeout:', errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [publicKey, connected, status, includeInactionable, handleError]
  );

  // Calculate statistics
  const stats = useCallback(() => {
    const totalPositions = positions.length;
    const activePositions = positions.filter((p) => p.status === 'active').length;

    const totalBorrowed = positions.reduce((sum, position) => {
      const borrowed = parseFloat(position.initialBorrowQuote) || 0;
      return sum + borrowed;
    }, 0);

    const totalInterestEarned = positions.reduce(
      (acc: Record<string, number>, position) => {
        // Only include interest from active positions
        if (position.status !== 'active') {
          return acc;
        }

        const quoteCurrency = position.quoteToken.symbol;
        const interest = position.interestAccrued || 0;

        if (!acc[quoteCurrency]) {
          acc[quoteCurrency] = 0;
        }
        acc[quoteCurrency] += interest;

        return acc;
      },
      { SOL: 0, USDC: 0 }
    );

    const averageLTV =
      positions.length > 0
        ? positions.reduce((sum, position) => {
            const ltv = position.positionLtv || 0;
            return sum + ltv;
          }, 0) / positions.length
        : 0;

    return {
      totalPositions,
      activePositions,
      totalBorrowed,
      totalInterestEarned,
      averageLTV,
    };
  }, [positions])();

  // Initial fetch
  useEffect(() => {
    fetchPositions(true);
  }, [fetchPositions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => fetchPositions(false), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPositions, autoRefresh, refreshInterval]);

  return {
    positions,
    loading,
    error,
    refetch: () => fetchPositions(true),
    stats,
  };
}

// Hook for filtering and sorting positions
export function usePositionFilters(positions: PositionV3Model[]) {
  const [filteredPositions, setFilteredPositions] = useState<PositionV3Model[]>(positions);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'closed' | 'liquidated',
    collateralToken: '',
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'openTimestamp',
    direction: 'desc' as 'asc' | 'desc',
  });

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...positions];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((position) => position.status === filters.status);
    }

    // Filter by collateral token
    if (filters.collateralToken) {
      filtered = filtered.filter(
        (position) =>
          position.collateralToken.symbol
            .toLowerCase()
            .includes(filters.collateralToken.toLowerCase()) ||
          position.collateralToken.name
            .toLowerCase()
            .includes(filters.collateralToken.toLowerCase())
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter((position) => {
        const borrowed = parseFloat(position.initialBorrowQuote) || 0;
        return borrowed >= minAmount;
      });
    }

    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter((position) => {
        const borrowed = parseFloat(position.initialBorrowQuote) || 0;
        return borrowed <= maxAmount;
      });
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (position) =>
          position.traderAddress.toString().toLowerCase().includes(term) ||
          position.collateralToken.symbol.toLowerCase().includes(term) ||
          position.collateralToken.name.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof PositionV3Model];
      let bValue: any = b[sortConfig.key as keyof PositionV3Model];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredPositions(filtered);
  }, [positions, filters, sortConfig]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      collateralToken: '',
      minAmount: '',
      maxAmount: '',
      searchTerm: '',
    });
  };

  return {
    filteredPositions,
    filters,
    sortConfig,
    updateFilter,
    updateSort,
    clearFilters,
  };
}
