import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
import { useWallet } from "@/contexts/WalletContext";
import toast from "react-hot-toast";

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
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    quoteToken = "SOL",
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

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
      const bal = parseFloat((data && data.balance) || data || 0);
      setBalance(bal);
    } catch (err: any) {
      const message = err.message || "Failed to fetch balance";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, quoteToken]);

  const deposit = useCallback(
    async (amount: number) => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      try {
        setError(null);
        await apiService.depositFunds({
          amount,
          quoteToken,
          userWallet: publicKey.toBase58(),
        });
        toast.success("Deposit submitted");
        await fetchBalance();
      } catch (err: any) {
        const message = err.message || "Deposit failed";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance],
  );

  const withdraw = useCallback(
    async (amount: number) => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      try {
        setError(null);
        await apiService.withdrawFunds({
          amount,
          quoteToken,
          userWallet: publicKey.toBase58(),
        });
        toast.success("Withdrawal submitted");
        await fetchBalance();
      } catch (err: any) {
        const message = err.message || "Withdrawal failed";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    [publicKey, quoteToken, fetchBalance],
  );

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalance, autoRefresh, refreshInterval]);

  return { balance, loading, error, refresh: fetchBalance, deposit, withdraw };
}
