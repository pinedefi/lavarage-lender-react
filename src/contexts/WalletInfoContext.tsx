import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { useWallet } from './WalletContext';
import { nftValidationService } from '@/services/nftValidation';
import { useApiWalletSync } from '@/hooks/useApiWalletSync';

type WalletInfoContextValue = {
  hasLavaRockNFT: boolean;
  isCheckingNFT: boolean;
  checkNFTOwnership: () => Promise<void>;
};

const WalletInfoContext = createContext<WalletInfoContextValue>({
  hasLavaRockNFT: false,
  isCheckingNFT: false,
  checkNFTOwnership: async () => {},
});

export const useWalletInfo = () => {
  const context = useContext(WalletInfoContext);
  if (!context) {
    throw new Error('useWalletInfo must be used within a WalletInfoProvider');
  }
  return context;
};

export const WalletInfoProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [hasLavaRockNFT, setHasLavaRockNFT] = useState(false);
  const [isCheckingNFT, setIsCheckingNFT] = useState(false);

  // Sync wallet address with API service
  useApiWalletSync();

  const checkNFTOwnership = async () => {
    if (!publicKey || !connected) {
      setHasLavaRockNFT(false);
      setIsCheckingNFT(false);
      return;
    }

    setIsCheckingNFT(true);
    try {
      const hasNFT = await nftValidationService.hasLavaRockNFT(publicKey.toBase58());
      setHasLavaRockNFT(hasNFT);
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setHasLavaRockNFT(false);
    } finally {
      setIsCheckingNFT(false);
    }
  };

  useEffect(() => {
    checkNFTOwnership();
  }, [publicKey, connected]);

  const value: WalletInfoContextValue = {
    hasLavaRockNFT,
    isCheckingNFT,
    checkNFTOwnership,
  };

  return <WalletInfoContext.Provider value={value}>{children}</WalletInfoContext.Provider>;
};
