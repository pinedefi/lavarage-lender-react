import React from 'react';
import { GradientText } from '@/components/brand';
import { formatNumberFloor } from '@/utils';
import { 
  DollarSign, 
  TrendingUp, 
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
    liquidated: number;
    pendingInterest: number;
  };
  loading: boolean;
}

export const BalanceBreakdown: React.FC<BalanceBreakdownProps> = ({
  token,
  balances,
  loading,
}) => {

  const formatAmount = (amount: number) => {
    return loading ? 'Loading...' : `${formatNumberFloor(amount, 6)} ${token}`;
  };

  // Define table rows with their data
  const balanceRows = [
    {
      icon: CheckCircle,
      label: 'Available',
      shortLabel: 'Available',
      description: 'Idle funds in pool ready to lend',
      amount: balances.available,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      amountColor: 'text-green-900'
    },
    {
      icon: Activity,
      label: 'Lent',
      shortLabel: 'Lent',
      description: 'Principal currently on loan',
      amount: balances.deployed,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      amountColor: 'text-blue-900'
    },
    {
      icon: TrendingUp,
      label: 'Accrued Interest',
      shortLabel: 'Accrued Interest',
      description: 'Earned interest, not yet received',
      amount: balances.pendingInterest,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      amountColor: 'text-purple-900'
    },
    {
      icon: AlertTriangle,
      label: 'Liquidated Proceeds',
      shortLabel: 'Liquidated Proceeds',
      description: 'Amount due back from liquidated positions',
      amount: balances.liquidated,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      amountColor: 'text-yellow-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pool Balance Breakdown Table */}
      <div className="card-lavarage overflow-hidden">
        {/* Header */}
        <div className="bg-lavarage-subtle p-6 border-b border-lavarage-orange/20">
          <div className="flex items-center">
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
        </div>

        {/* Mobile Cards (shown on small screens) */}
        <div className="block md:hidden space-y-3 p-4">
          {balanceRows.map((row, index) => {
            const IconComponent = row.icon;
            return (
              <div key={index} className={`${row.bgColor} rounded-lg p-4 border border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`p-2 rounded-full bg-white mr-3 shadow-sm flex-shrink-0`}>
                      <IconComponent className={`h-4 w-4 ${row.iconColor}`} />
                    </div>
                    <span className={`text-sm font-semibold ${row.textColor} truncate`}>
                      {row.shortLabel}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-sm font-bold ${row.amountColor}`}>
                      {formatAmount(row.amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-lavarage-orange/10 to-lavarage-coral/10 border-b border-lavarage-orange/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-lavarage-coral uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-lavarage-coral uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-lavarage-coral uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-gradient-to-b from-white/80 to-lavarage-yellow/5 divide-y divide-lavarage-orange/20">
              {balanceRows.map((row, index) => {
                const IconComponent = row.icon;
                return (
                  <tr key={index} className="hover:bg-lavarage-yellow/10 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${row.bgColor} mr-3 shadow-sm`}>
                          <IconComponent className={`h-4 w-4 ${row.iconColor}`} />
                        </div>
                        <span className={`text-sm font-medium ${row.textColor}`}>
                          {row.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {row.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${row.amountColor}`}>
                        {formatAmount(row.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="bg-lavarage-subtle border-t-2 border-lavarage-coral p-6">
          <div className="flex items-center justify-between">
            <div>
              <GradientText variant="primary" size="lg" weight="semibold">
                Total Pool Balance
              </GradientText>
              <p className="text-sm text-gray-500">All funds in lending pool</p>
            </div>
            <div className="text-right">
              <GradientText variant="primary" size="2xl" weight="bold">
                {formatAmount(balances.total)}
              </GradientText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
