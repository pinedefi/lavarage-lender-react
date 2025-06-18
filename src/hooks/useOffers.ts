import { useState, useEffect, useCallback } from "react";
import { OfferV2Model } from "@/types";
import { apiService } from "@/services/api";
import { useWallet } from "@/contexts/WalletContext";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import bs58 from "bs58";
import { VersionedTransaction } from "@solana/web3.js";

interface UseOffersOptions {
  includeTokens?: boolean;
  inactiveOffers?: boolean;
  includeRawData?: boolean;
  chain?: 'solana' | 'bsc';
  tags?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOffersReturn {
  offers: OfferV2Model[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOffer: (data: any) => Promise<void>;
  updateOffer: (data: any) => Promise<void>;
  changeLTV: (offerAddress: string, newLTV: number) => Promise<void>;
}

export function useOffers(options: UseOffersOptions = {}): UseOffersReturn {
  const [offers, setOffers] = useState<OfferV2Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, connected, sendTransaction } = useWallet();

  const {
    includeTokens = true,
    inactiveOffers = false,
    includeRawData = false,
    chain = 'solana',
    tags,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const fetchOffers = useCallback(async () => {
    if (!connected || !publicKey) {
      setOffers([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiService.getLenderOffers({
        lenderWallet: publicKey.toBase58(),
        inactiveOffers,
        includeRawData,
        chain,
        tags,
      });
      setOffers(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch offers';
      setError(errorMessage);
      console.error('Error fetching offers:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, inactiveOffers, includeRawData, chain, tags]);

  const createOffer = useCallback(
    async (data: any) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setError(null);
        const offerData = {
          ...data,
          userWallet: publicKey.toBase58(),
        };

        const tx = await apiService.createOffer(offerData);
        console.log("Create offer submitted", tx);

        // Decode the transaction from base58
        const transactionBuffer = bs58.decode(tx.transaction);
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Send the transaction directly
        const signature = await sendTransaction(transaction);

        console.log("Transaction sent with signature:", signature);
        toast.success("Offer created successfully");

        // Refresh offers after creation
        await fetchOffers();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create offer';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [publicKey, fetchOffers, sendTransaction]
  );

  const updateOffer = useCallback(
    async (data: any) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setError(null);
        const updateData = {
          ...data,
          userWallet: publicKey.toBase58(),
        };

        const tx = await apiService.updateOffer(updateData);
        console.log("Update offer submitted", tx);

        // Decode the transaction from base58
        const transactionBuffer = bs58.decode(tx.transaction);
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Send the transaction directly
        const signature = await sendTransaction(transaction);

        console.log("Transaction sent with signature:", signature);
        toast.success("Offer updated successfully");

        // Refresh offers after update
        await fetchOffers();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update offer';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [publicKey, fetchOffers, sendTransaction]
  );

  const { signMessage } = useSolanaWallet();

  const changeLTV = useCallback(
    async (offerAddress: string, newLTV: number) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!signMessage) {
        throw new Error('Wallet does not support message signing');
      }

      try {
        setError(null);

        const message = new TextEncoder().encode(`${offerAddress}:${newLTV}`);
        const signedMessage = await signMessage(message);
        const signature = bs58.encode(signedMessage);

        await apiService.changeLTV({
          offerAddress,
          signature,
          newLTV,
        });

        toast.success('LTV updated successfully');

        // Refresh offers after LTV change
        await fetchOffers();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update LTV';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [publicKey, signMessage, fetchOffers]
  );

  // Initial fetch
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOffers, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOffers, autoRefresh, refreshInterval]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
    createOffer,
    updateOffer,
    changeLTV,
  };
}

// Hook for getting all offers (not just user's)
export function useAllOffers(options: UseOffersOptions = {}) {
  const [offers, setOffers] = useState<OfferV2Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    includeTokens = true,
    inactiveOffers = false,
    includeRawData = false,
    chain = 'solana',
    tags,
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  const fetchOffers = useCallback(async () => {
    try {
      setError(null);
      const data = await apiService.getOffers({
        includeTokens,
        inactiveOffers,
        includeRawData,
        chain,
        tags,
      });
      setOffers(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch offers';
      setError(errorMessage);
      console.error('Error fetching all offers:', err);
    } finally {
      setLoading(false);
    }
  }, [includeTokens, inactiveOffers, includeRawData, chain, tags]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOffers, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOffers, autoRefresh, refreshInterval]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
  };
}
