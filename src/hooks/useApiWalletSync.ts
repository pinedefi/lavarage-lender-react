import { useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { apiService } from '@/services/api';

/**
 * Hook to automatically sync the connected wallet address with the API service
 * This ensures NFT validation can access the current wallet address
 */
export const useApiWalletSync = () => {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      apiService.setWalletAddress(publicKey.toBase58());
    } else {
      apiService.setWalletAddress(null);
    }
  }, [connected, publicKey]);
};
