import { useState, useEffect, useCallback } from 'react';
import { OfferV2Model } from '@/types';
import { apiService } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import toast from 'react-hot-toast';

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
  const { publicKey, connected } = useWallet();

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

  const createOffer = useCallback(async (data: any) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      const offerData = {
        ...data,
        userWallet: publicKey.toBase58(),
      };
      
      const transaction = await apiService.createOffer(offerData);
      
      // TODO: Sign and send transaction
      toast.success('Offer created successfully');
      
      // Refresh offers after creation
      await fetchOffers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create offer';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [publicKey, fetchOffers]);

  const updateOffer = useCallback(async (data: any) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      const updateData = {
        ...data,
        userWallet: publicKey.toBase58(),
      };
      
      const transaction = await apiService.updateOffer(updateData);
      
      // TODO: Sign and send transaction
      toast.success('Offer updated successfully');
      
      // Refresh offers after update
      await fetchOffers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update offer';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [publicKey, fetchOffers]);

  const changeLTV = useCallback(async (offerAddress: string, newLTV: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      
      // TODO: Create and sign message for LTV change
      const signature = 'placeholder_signature';
      
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
  }, [publicKey, fetchOffers]);

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