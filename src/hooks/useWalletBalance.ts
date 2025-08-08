import { useState, useEffect, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@/contexts/WalletContext';
import { SOL_ADDRESS, USDC_ADDRESS } from '@/utils/tokens';

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
    async (walletPublicKey: PublicKey, mintAddress: string, decimals: number): Promise<number> => {
      try {
        // Calculate the Associated Token Account address manually
        const mintPublicKey = new PublicKey(mintAddress);

        // Find associated token address using the standard formula
        const [associatedTokenAddress] = await PublicKey.findProgramAddress(
          [
            walletPublicKey.toBuffer(),
            new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), // TOKEN_PROGRAM_ID
            mintPublicKey.toBuffer(),
          ],
          new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') // ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

        if (!accountInfo) {
          return 0; // Account doesn't exist
        }

        // Parse the account data to get the token balance
        // Token account data structure: amount is at bytes 64-72 (8 bytes, little-endian)
        const data = accountInfo.data;
        if (data.length < 72) {
          return 0;
        }

        // Read 8 bytes starting at position 64 (amount field)
        const amountBuffer = data.slice(64, 72);
        let amount = BigInt(0);
        for (let i = 0; i < 8; i++) {
          amount += BigInt(amountBuffer[i]) << (BigInt(i) * BigInt(8));
        }

        const balance = Number(amount) / Math.pow(10, decimals);
        return balance;
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
        fetchSPLTokenBalance(publicKey, USDC_ADDRESS, 6), // USDC has 6 decimals
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
