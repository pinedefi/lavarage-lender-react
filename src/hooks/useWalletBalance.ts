import { useState, useEffect, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useWallet } from '@/contexts/WalletContext';
import { USDC_ADDRESS } from '@/utils/tokens';

interface WalletBalances {
  SOL: number;
  USDC: number;
}

interface UseWalletBalanceOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWalletBalanceReturn {
  balances: WalletBalances;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWalletBalance(options: UseWalletBalanceOptions = {}): UseWalletBalanceReturn {
  const { publicKey, connected, connection } = useWallet();
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [balances, setBalances] = useState<WalletBalances>({ SOL: 0, USDC: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSOLBalance = useCallback(
    async (walletPublicKey: PublicKey): Promise<number> => {
      try {
        const balance = await connection.getBalance(walletPublicKey);
        return balance / LAMPORTS_PER_SOL;
      } catch (err) {
        console.error('Error fetching SOL balance:', err);
        return 0;
      }
    },
    [connection]
  );

  const fetchSPLTokenBalance = useCallback(
    async (walletPublicKey: PublicKey, mintAddress: string): Promise<number> => {
      try {
        // Use canonical helper to get the Associated Token Account address
        const mintPublicKey = new PublicKey(mintAddress);
        const associatedTokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          walletPublicKey,
          false, // allowOwnerOffCurve
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Use the safer getTokenAccountBalance RPC helper
        const tokenAccountBalance = await connection.getTokenAccountBalance(associatedTokenAddress);

        // Return the UI amount which is already adjusted for decimals
        return tokenAccountBalance.value.uiAmount || 0;
      } catch (err) {
        // Account might not exist if user has never held the token
        console.log(`No token account found for ${mintAddress}:`, err);
        return 0;
      }
    },
    [connection]
  );

  const fetchBalances = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalances({ SOL: 0, USDC: 0 });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Fetch balances concurrently
      const [solBalance, usdcBalance] = await Promise.all([
        fetchSOLBalance(publicKey),
        fetchSPLTokenBalance(publicKey, USDC_ADDRESS), // getTokenAccountBalance handles decimals automatically
      ]);

      setBalances({
        SOL: solBalance,
        USDC: usdcBalance,
      });
    } catch (err: any) {
      const message = err.message || 'Failed to fetch wallet balances';
      console.error('Wallet balance fetch error:', message);
      setError(message);
      // Don't reset balances on error, keep previous values
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, fetchSOLBalance, fetchSPLTokenBalance]);

  // Initial fetch
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchBalances();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchBalances, autoRefresh, refreshInterval]);

  return {
    balances,
    loading,
    error,
    refresh: fetchBalances,
  };
}
