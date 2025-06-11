import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view detailed analytics and performance metrics.
            </p>
            <Button className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Advanced analytics and performance insights for your lending portfolio
        </p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Advanced Analytics Coming Soon
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're building comprehensive analytics tools including performance tracking, 
            risk analysis, and portfolio optimization insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary">
              <Activity className="h-4 w-4 mr-2" />
              View Basic Stats
            </Button>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Request Early Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;