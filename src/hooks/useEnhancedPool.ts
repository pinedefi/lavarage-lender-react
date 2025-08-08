import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import { useError } from '@/contexts/ErrorContext';
import { SOL_ADDRESS } from '@/utils/tokens';

const EXPECTED_BALANCE_ERRORS = ['node wallet not found', 'failed to get pool balance'] as const;

interface EnhancedPoolBalances {
  total: number;
  available: number;
  deployed: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  liquidated: number; // Amount from liquidations pending to return to lender
}

interface EnhancedPoolPerformance {
  totalInterestEarned: number;
  averageAPY: number;
  activeOffers: number;
  totalPositions: number;
  pendingInterest: number; // Interest accrued but not yet claimed
  pendingLiquidation: number; // Liquidations in progress/cooldown
}

interface EnhancedPoolData {
  poolId: string;
  quoteToken: 'SOL' | 'USDC';
  balances: EnhancedPoolBalances;
  performance: EnhancedPoolPerformance;
  userWalletBalance: number; // Balance in user's personal wallet (not pool)
}

interface WalletBalances {
  SOL: number;
  USDC: number;
}

interface UseEnhancedPoolOptions {
  quoteToken?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  hasOffers?: boolean;
  walletBalances?: WalletBalances;
}

interface UseEnhancedPoolReturn {
  data: EnhancedPoolData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEnhancedPool(options: UseEnhancedPoolOptions = {}): UseEnhancedPoolReturn {
  const { publicKey, connected } = useWallet();
  const { handleError } = useError();
  const [data, setData] = useState<EnhancedPoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    quoteToken = 'SOL',
    autoRefresh = true,
    refreshInterval = 30000,
    walletBalances = { SOL: 0, USDC: 0 },
  } = options;

  const fetchBalanceData = useCallback(async () => {
    if (!connected || !publicKey) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch pool balance data from API
      const balanceResponse = await apiService.getPoolBalance({
        userWallet: publicKey.toBase58(),
        quoteToken,
      });

      // Extract balance data - with fallbacks for data that might not be implemented yet
      const balances: EnhancedPoolBalances = {
        total: parseFloat(balanceResponse?.balances?.total ?? 0),
        available: parseFloat(balanceResponse?.balances?.available ?? 0),
        deployed: parseFloat(balanceResponse?.balances?.deployed ?? 0),
        pendingDeposits: parseFloat(balanceResponse?.balances?.pendingDeposits ?? 0),
        pendingWithdrawals: parseFloat(balanceResponse?.balances?.pendingWithdrawals ?? 0),
        // These might come from different endpoints or calculations
        liquidated: parseFloat(balanceResponse?.balances?.liquidated ?? 0),
      };

      const performance: EnhancedPoolPerformance = {
        totalInterestEarned: parseFloat(balanceResponse?.performance?.totalInterestEarned ?? 0),
        averageAPY: parseFloat(balanceResponse?.performance?.averageAPY ?? 0),
        activeOffers: parseInt(balanceResponse?.performance?.activeOffers ?? 0),
        totalPositions: parseInt(balanceResponse?.performance?.totalPositions ?? 0),
        // These might need to be calculated from position data
        pendingInterest: parseFloat(balanceResponse?.performance?.pendingInterest ?? 0),
        pendingLiquidation: parseFloat(balanceResponse?.performance?.pendingLiquidation ?? 0),
      };

      // Get user wallet balance from wallet balance hook
      const userWalletBalance =
        quoteToken === SOL_ADDRESS ? walletBalances.SOL : walletBalances.USDC;

      const enhancedData: EnhancedPoolData = {
        poolId: balanceResponse?.poolId || 'unknown',
        quoteToken: quoteToken as 'SOL' | 'USDC',
        balances,
        performance,
        userWalletBalance,
      };

      setData(enhancedData);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch balance data';

      // Check for expected errors that shouldn't show toast notifications
      const isExpectedError = EXPECTED_BALANCE_ERRORS.some((e) =>
        message.toLowerCase().includes(e)
      );

      if (isExpectedError) {
        // For expected errors, set empty data and don't show error
        console.log('Expected pool balance error:', message);
        const emptyData: EnhancedPoolData = {
          poolId: 'none',
          quoteToken: quoteToken as 'SOL' | 'USDC',
          balances: {
            total: 0,
            available: 0,
            deployed: 0,
            pendingDeposits: 0,
            pendingWithdrawals: 0,
            liquidated: 0,
          },
          performance: {
            totalInterestEarned: 0,
            averageAPY: 0,
            activeOffers: 0,
            totalPositions: 0,
            pendingInterest: 0,
            pendingLiquidation: 0,
          },
          userWalletBalance: 0,
        };
        setData(emptyData);
        setError(null);
      } else {
        // For unexpected/critical errors, show them
        setError(message);
        handleError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, quoteToken, handleError, walletBalances]);

  useEffect(() => {
    fetchBalanceData();
  }, [fetchBalanceData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchBalanceData(), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalanceData, autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh: fetchBalanceData,
  };
}
