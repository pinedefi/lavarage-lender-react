import React from 'react';
import { GradientText } from '@/components/brand';
import { formatNumberFloor } from '@/utils';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Activity
} from 'lucide-react';

interface BalanceBreakdownProps {
  token: 'SOL' | 'USDC';
  balances: {
    total: number;
    available: number;
    deployed: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    liquidated: number;
  };
  performance: {
    totalInterestEarned: number;
    averageAPY: number;
    activeOffers: number;
    totalPositions: number;
    pendingInterest: number;
    pendingLiquidation: number;
  };
  loading: boolean;
}

export const BalanceBreakdown: React.FC<BalanceBreakdownProps> = ({
  token,
  balances,
  performance,
  loading,
}) => {
  const formatBalance = (amount: number) => {
    return loading ? 'Loading...' : `${formatNumberFloor(amount, 6)} ${token}`;
  };

  return (
    <div className="space-y-6">
     
      {/* Pool Balances Breakdown */}
      <div className="card-lavarage p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-full bg-lavarage-primary mr-3">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <GradientText variant="primary" size="lg" weight="semibold">
              Pool Balance Breakdown
            </GradientText>
            <p className="text-sm text-gray-500">Detailed breakdown of your lending pool</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Available Balance */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Available</span>
              </div>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatBalance(balances.available)}
            </p>
            <p className="text-xs text-green-600 mt-1">Ready for new loans</p>
          </div>

          {/* Deployed Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Deployed</span>
              </div>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {formatBalance(balances.deployed)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Currently in active positions</p>
          </div>

          {/* Liquidated Funds */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">Liquidated</span>
              </div>
            </div>
            <p className="text-lg font-bold text-yellow-900">
              {formatBalance(balances.liquidated)}
            </p>
            <p className="text-xs text-yellow-600 mt-1">Pending return to wallet</p>
          </div>

          {/* Pending Interest */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Pending Interest</span>
              </div>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {formatBalance(performance.pendingInterest)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Accrued but not claimed</p>
          </div>

          {/* Pending Liquidation */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">Pending Liquidation</span>
              </div>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatBalance(performance.pendingLiquidation)}
            </p>
            <p className="text-xs text-orange-600 mt-1">In liquidation process</p>
          </div>

          {/* Pending Deposits */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-800">Pending Deposits</span>
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatBalance(balances.pendingDeposits)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Waiting for confirmation</p>
          </div>
        </div>

        {/* Total Balance Summary */}
        <div className="mt-6 pt-6 border-t border-lavarage-orange/20">
          <div className="flex items-center justify-between">
            <div>
              <GradientText variant="primary" size="lg" weight="semibold">
                Total Pool Balance
              </GradientText>
              <p className="text-sm text-gray-500">All funds in lending pool</p>
            </div>
            <div className="text-right">
              <GradientText variant="primary" size="2xl" weight="bold">
                {formatBalance(balances.total)}
              </GradientText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
