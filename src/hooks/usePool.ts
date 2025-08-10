import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import toast from 'react-hot-toast';
import bs58 from 'bs58';
import { VersionedTransaction } from '@solana/web3.js';
import { useError } from '@/contexts/ErrorContext';
import { SOL_ADDRESS } from '@/utils/tokens';

const EXPECTED_BALANCE_ERRORS = [
  'node wallet not found', // new wallets with no deposits
  'failed to get pool balance', // token account doesn't exist yet
] as const;
interface UsePoolOptions {
  quoteToken?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  hasOffers?: boolean;
}

interface UsePoolReturn {
  balance: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deposit: (amount: number, overrideUserWallet?: string) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

export function usePool(options: UsePoolOptions = {}): UsePoolReturn {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { handleError } = useError();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { quoteToken = 'SOL', autoRefresh = true, refreshInterval = 30000, hasOffers } = options;

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

      // Check for expected errors that shouldn't show toast notifications
      const isExpectedError = EXPECTED_BALANCE_ERRORS.some((e) =>
        message.toLowerCase().includes(e)
      );

      if (isExpectedError) {
        // For expected errors, set balance to 0 and don't show error
        console.log('Expected pool balance error:', message);
        setBalance(0);
        setError(null);
      } else {
        // For unexpected/critical errors, show them
        setError(message);
        // Handle LavaRock NFT errors globally
        handleError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, quoteToken, handleError]);

  const deposit = useCallback(
    async (amount: number, overrideUserWallet?: string) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
      try {
        setError(null);
        const tx = await apiService.depositFunds({
          amount: amount * 10 ** (quoteToken === SOL_ADDRESS ? 9 : 6),
          quoteToken,
          userWallet: overrideUserWallet && overrideUserWallet.trim().length > 0
            ? overrideUserWallet.trim()
            : publicKey.toBase58(),
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

        // Check for expected errors that shouldn't show toast notifications
        const isExpectedError = EXPECTED_BALANCE_ERRORS.some((e) =>
          message.toLowerCase().includes(e)
        );

        if (isExpectedError) {
          const offerRequiredMessage = 'You need to create a loan offer before depositing funds.';
          setError(offerRequiredMessage);
        } else {
          setError(message);
          // Handle LavaRock NFT errors globally first
          handleError(message);
        }

        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance, sendTransaction, handleError, hasOffers]
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

        // Check for expected errors that shouldn't show toast notifications
        const isExpectedError = EXPECTED_BALANCE_ERRORS.some((e) =>
          message.toLowerCase().includes(e)
        );

        if (isExpectedError) {
          const offerRequiredMessage = 'You need to create a loan offer before withdrawing funds.';
          setError(offerRequiredMessage);
        } else {
          setError(message);
          // Handle LavaRock NFT errors globally first
          handleError(message);
        }

        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance, sendTransaction, handleError, hasOffers]
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
