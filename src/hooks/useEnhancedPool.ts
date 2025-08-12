import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import { useError } from '@/contexts/ErrorContext';
import { SOL_ADDRESS } from '@/utils/tokens';
import { useLiquidations } from '@/hooks/useLiquidations';
import { useOffers } from '@/hooks/useOffers';
import { usePositions } from '@/hooks/usePositions';
import { LiquidationData, PositionV3Model } from '@/types';

const EXPECTED_BALANCE_ERRORS = ['node wallet not found', 'failed to get pool balance'] as const;

/**
 * Calculate the liquidated amount from liquidations data
 * This is the amount that will be sent back to the node wallet after liquidation & cooldown
 */
const calculateLiquidatedAmount = (
  liquidations: LiquidationData[],
  userOfferAddresses: Set<string>,
  targetQuoteTokenAddress: string
): number => {
  if (!liquidations.length || !userOfferAddresses.size) return 0;

  // Determine decimals based on token address
  const getTokenDecimals = (tokenAddress: string): number => {
    if (tokenAddress === SOL_ADDRESS) return 9;
    // For USDC and other tokens, assume 6 decimals (could be made more dynamic later)
    return 6;
  };

  const tokenDecimals = getTokenDecimals(targetQuoteTokenAddress);

  return liquidations
    .filter((liquidation) => {
      // Only include liquidations from user's offers
      if (!userOfferAddresses.has(liquidation.offer)) return false;

      // Only include liquidations that haven't been sent back yet (no sendTx)
      if (liquidation.sendTx) return false;

      // Check if liquidation is for the target quote token
      // In the liquidation data, toReceiveToken should match the quote token
      return liquidation.toReceiveToken === targetQuoteTokenAddress;
    })
    .reduce((total, liquidation) => {
      // soldFor is the amount after fees that will be returned to the lender
      // Convert from raw amount to decimal amount
      const decimalAmount = liquidation.soldFor / Math.pow(10, tokenDecimals);
      return total + decimalAmount;
    }, 0);
};

/**
 * Calculate pending interest from active positions for a specific quote token
 * This is the interest accrued from traders who opened positions against the lender's offers
 */
const calculatePendingInterest = (
  positions: PositionV3Model[],
  userOfferAddresses: Set<string>,
  targetQuoteToken: string
): number => {
  if (!positions.length || !userOfferAddresses.size) return 0;

  return positions
    .filter((position) => {
      // Only include active positions (where interest is still accruing)
      if (position.status !== 'active') return false;

      // Only include positions from user's offers
      if (!userOfferAddresses.has(position.offerAddress.toString())) return false;

      // Only include positions for the target quote token
      return (
        position.quoteToken.symbol === targetQuoteToken ||
        position.quoteToken.address === targetQuoteToken
      );
    })
    .reduce((total, position) => {
      // interestAccrued is the pending interest for this position
      const interest = position.interestAccrued || 0;
      return total + interest;
    }, 0);
};

interface EnhancedPoolBalances {
  total: number;
  available: number;
  deployed: number;
  liquidated: number; // Amount from liquidations pending to return to lender
  pendingInterest: number;
}
interface EnhancedPoolData {
  poolId: string;
  quoteToken: 'SOL' | 'USDC';
  balances: EnhancedPoolBalances;
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

  // Fetch liquidations data to calculate liquidated amounts
  const { liquidations } = useLiquidations();

  // Fetch user's offers to determine which liquidations belong to them
  const { offers: lenderOffers } = useOffers({ includeTokens: true, inactiveOffers: true });

  // Fetch positions data to calculate pending interest
  const { positions } = usePositions({
    status: 'all',
    includeInactionable: true,
    autoRefresh: true,
  });

  // Create a set of offer addresses that the user owns for the target quote token
  const userOfferAddresses = useMemo(() => {
    if (!publicKey) return new Set<string>();

    return new Set(
      lenderOffers
        .filter((offer) => {
          // Filter offers by quote token
          if (typeof offer.quoteToken === 'string') {
            return offer.quoteToken === quoteToken;
          } else if (offer.quoteToken && typeof offer.quoteToken === 'object') {
            return offer.quoteToken.address === quoteToken;
          }
          return false;
        })
        .map((offer) => offer.publicKey.toString())
    );
  }, [lenderOffers, publicKey, quoteToken]);

  // Calculate liquidated amount from liquidations data
  const liquidatedAmount = useMemo(() => {
    // Convert quoteToken to the proper address format if needed
    const targetTokenAddress = quoteToken === 'SOL' ? SOL_ADDRESS : quoteToken;
    return calculateLiquidatedAmount(liquidations, userOfferAddresses, targetTokenAddress);
  }, [liquidations, userOfferAddresses, quoteToken]);

  // Calculate pending interest from active positions
  const pendingInterest = useMemo(() => {
    // Use the quoteToken symbol for matching (SOL or USDC)
    const targetTokenSymbol = quoteToken === 'SOL' || quoteToken === SOL_ADDRESS ? 'SOL' : 'USDC';
    return calculatePendingInterest(positions, userOfferAddresses, targetTokenSymbol);
  }, [positions, userOfferAddresses, quoteToken]);

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

      // Extract balance data - liquidated amount and pending interest are calculated from external data
      const balances: EnhancedPoolBalances = {
        total: parseFloat(balanceResponse?.balances?.total ?? 0),
        available: parseFloat(balanceResponse?.balances?.available ?? 0),
        deployed: parseFloat(balanceResponse?.balances?.deployed ?? 0),
        liquidated: liquidatedAmount, // Use calculated amount from liquidations data
        pendingInterest: pendingInterest, // Use calculated amount from positions data
      };

      // Get user wallet balance from wallet balance hook
      const userWalletBalance =
        quoteToken === SOL_ADDRESS ? walletBalances.SOL : walletBalances.USDC;

      const enhancedData: EnhancedPoolData = {
        poolId: balanceResponse?.poolId || 'unknown',
        quoteToken: quoteToken as 'SOL' | 'USDC',
        balances,
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
        const emptyData: EnhancedPoolData = {
          poolId: 'none',
          quoteToken: quoteToken as 'SOL' | 'USDC',
          balances: {
            total: 0,
            available: 0,
            deployed: 0,
            liquidated: 0,
            pendingInterest: 0,
          },
          userWalletBalance: 0,
        };
        setData(emptyData);
        setError(null);
      } else {
        // For unexpected/critical errors, show them (but silently handle timeout errors for background requests)
        setError(message);
        if (!message.toLowerCase().includes('timeout')) {
          handleError(message);
        } else {
          // Log timeout for debugging but don't show toast for background refresh
          console.log('Background pool balance timeout:', message);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    connected,
    publicKey,
    quoteToken,
    handleError,
    walletBalances,
    liquidatedAmount,
    pendingInterest,
  ]);

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
