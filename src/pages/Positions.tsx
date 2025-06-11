import React from 'react';
import { usePositions } from '@/hooks/usePositions';
import { useWallet } from '@/contexts/WalletContext';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatNumber, formatPercentage, formatDate, getRiskLevel } from '@/utils';

const Positions: React.FC = () => {
  const { connected } = useWallet();
  const { positions, loading, stats } = usePositions({ autoRefresh: true });

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view borrower positions using your liquidity.
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrower Positions</h1>
          <p className="text-gray-600 mt-1">
            Monitor positions using your liquidity and track performance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPositions}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold text-success-600">{stats.activePositions}</p>
              </div>
              <div className="p-3 bg-success-50 rounded-lg">
                <Activity className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatNumber(stats.totalBorrowed / 1e9, 2)} SOL
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interest Earned</p>
                <p className="text-2xl font-bold text-warning-600">
                  {formatNumber(stats.totalInterestEarned, 2)} SOL
                </p>
              </div>
              <div className="p-3 bg-warning-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Trader</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Collateral</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Borrowed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">LTV</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Interest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, index) => {
                    const ltv = parseFloat(position.currentLtv);
                    const riskLevel = getRiskLevel(ltv);
                    
                    return (
                      <tr key={position.positionAddress.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {position.traderAddress.toString().slice(0, 8)}...
                              </p>
                              <p className="text-sm text-gray-500">
                                Trader #{index + 1}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {position.collateralToken.symbol}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(parseFloat(position.currentPositionBase) / 1e9, 4)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatNumber(parseFloat(position.initialBorrowQuote) / 1e9, 2)} SOL
                            </p>
                            <p className="text-sm text-gray-500">
                              ${formatNumber(parseFloat(position.initialBorrowQuote) / 1e9 * 100, 2)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${riskLevel.color}`}>
                              {formatPercentage(ltv * 100)}
                            </span>
                            {ltv > 0.8 && (
                              <AlertTriangle className="h-4 w-4 text-error-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {riskLevel.label}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatNumber(position.interestAccrued, 4)} SOL
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPercentage(position.apr)}% APR
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              position.status === 'active'
                                ? 'success'
                                : position.status === 'liquidated'
                                ? 'error'
                                : 'gray'
                            }
                            size="sm"
                          >
                            {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {formatDate(position.openTimestamp, 'short')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(position.openTimestamp, 'relative')}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No positions found
              </h3>
              <p className="text-gray-600">
                When borrowers use your loan offers, their positions will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Positions;