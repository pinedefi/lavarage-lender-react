import React from 'react';
import { useWalletInfo } from '@/contexts/WalletInfoContext';
import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/brand/LoadingSpinner';

interface RequireNFTProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireNFT: React.FC<RequireNFTProps> = ({ children, fallback }): JSX.Element => {
  const { hasLavaRockNFT, isCheckingNFT, checkNFTOwnership } = useWalletInfo();
  const { connected, connect, publicKey } = useWallet();

  if (!connected) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection Required</h2>
        <p className="text-gray-600 mb-6">Please connect your wallet to access lender features.</p>
        <Button onClick={connect} className="w-full">
          Connect Wallet
        </Button>
      </Card>
    );
  }

  if (isCheckingNFT) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Checking NFT ownership...</p>
      </Card>
    );
  }

  if (!hasLavaRockNFT) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Lavarock NFT Required</h2>
        <p className="text-gray-600 mb-6">
          You need to own a Lavarock NFT to access lender features. Please make sure your wallet (
          {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}) contains a
          Lavarock NFT.
        </p>
        <div className="space-y-3">
          <Button onClick={checkNFTOwnership} variant="outline" className="w-full">
            Refresh NFT Check
          </Button>
          <Button
            onClick={() =>
              window.open(
                'https://lavarage.gitbook.io/lavarage/community/lava-rock-alpha',
                '_blank'
              )
            }
            className="w-full"
          >
            Get Lavarock NFT
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
