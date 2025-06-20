import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GradientText, LoadingSpinner } from '@/components/brand';
import { useWallet, WalletMultiButton } from '@/contexts/WalletContext';
import { AlertTriangle, Activity, Shield } from 'lucide-react';

const Liquidations: React.FC = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-lavarage-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-lavarage-red" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to monitor positions at risk of liquidation.
            </p>
            <WalletMultiButton className="w-full !bg-lavarage-primary !rounded-md hover:!bg-lavarage-primary/90" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Liquidations
          </GradientText>
          <p className="text-gray-600 mt-2">
            Monitor positions at risk of{' '}
            <span className="font-semibold text-lavarage-red">liquidation</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-lavarage-red" />
            <span>At Risk Positions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Positions at Risk</h3>
            <p className="mt-2 text-center text-gray-600">
              There are currently no positions at risk of liquidation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Liquidations;
