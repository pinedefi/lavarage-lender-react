import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import toast from 'react-hot-toast';
import bs58 from 'bs58';
import { VersionedTransaction } from '@solana/web3.js';
import { useError } from '@/contexts/ErrorContext';

interface UsePoolOptions {
  quoteToken?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePoolReturn {
  balance: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

export function usePool(options: UsePoolOptions = {}): UsePoolReturn {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { handleError } = useError();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { quoteToken = 'SOL', autoRefresh = true, refreshInterval = 30000 } = options;

  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalance(0);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await apiService.getPoolBalance({
        userWallet: publicKey.toBase58(),
        quoteToken,
      });
      console.log(quoteToken, data);
      const bal = parseFloat((data && data.balances && data.balances.available) ?? 0);
      console.log(quoteToken, bal);
      setBalance(bal);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch balance';
      setError(message);

      // Handle LavaRock NFT errors globally
      handleError(message);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, quoteToken, handleError]);

  const deposit = useCallback(
    async (amount: number) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
      try {
        setError(null);
        const tx = await apiService.depositFunds({
          amount:
            amount * 10 ** (quoteToken === 'So11111111111111111111111111111111111111112' ? 9 : 6),
          quoteToken,
          userWallet: publicKey.toBase58(),
        });
        console.log('Deposit submitted', tx);

        // Decode the transaction from base58
        const transactionBuffer = bs58.decode(tx.transaction);
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Send the transaction directly
        const signature = await sendTransaction(transaction);

        console.log('Transaction sent with signature:', signature);
        toast.success('Deposit submitted successfully');
        await fetchBalance();
      } catch (err: any) {
        const message = err.message || 'Deposit failed';
        setError(message);

        // Handle LavaRock NFT errors globally first
        handleError(message);

        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance, sendTransaction, handleError]
  );

  const withdraw = useCallback(
    async (amount: number) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
      try {
        setError(null);
        const tx = await apiService.withdrawFunds({
          amount:
            amount * 10 ** (quoteToken === 'So11111111111111111111111111111111111111112' ? 9 : 6),
          quoteToken,
          userWallet: publicKey.toBase58(),
        });
        console.log('Withdraw submitted', tx);

        // Decode the transaction from base58
        const transactionBuffer = bs58.decode(tx.transaction);
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Send the transaction directly
        const signature = await sendTransaction(transaction);

        console.log('Transaction sent with signature:', signature);
        toast.success('Withdrawal submitted successfully');
        await fetchBalance();
      } catch (err: any) {
        const message = err.message || 'Withdraw failed';
        setError(message);

        // Handle LavaRock NFT errors globally first
        handleError(message);

        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance, sendTransaction, handleError]
  );

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchBalance(), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalance, autoRefresh, refreshInterval]);

  return { balance, loading, error, refresh: fetchBalance, deposit, withdraw };
}
