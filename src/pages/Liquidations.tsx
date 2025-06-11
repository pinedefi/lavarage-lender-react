import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatNumber, formatPercentage, formatDate } from '@/utils';

const Liquidations: React.FC = () => {
  const { connected } = useWallet();

  // Mock data for demonstration
  const liquidations = [
    {
      id: '1',
      positionId: 'pos_123',
      collateralAmount: '1000',
      liquidationPrice: 95.5,
      saleProceeds: 1020,
      pnl: 50,
      status: 'deposited' as const,
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      positionId: 'pos_456',
      collateralAmount: '500',
      liquidationPrice: 88.2,
      saleProceeds: 480,
      pnl: -20,
      status: 'processing' as const,
      timestamp: '2024-01-14T15:45:00Z',
    },
    {
      id: '3',
      positionId: 'pos_789',
      collateralAmount: '750',
      liquidationPrice: 92.1,
      saleProceeds: 720,
      pnl: 15,
      status: 'cooldown' as const,
      timestamp: '2024-01-13T09:20:00Z',
      cooldownEndsAt: '2024-01-15T09:20:00Z',
    },
  ];

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view liquidation events and proceeds.
            </p>
            <Button className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deposited':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-warning-500" />;
      case 'cooldown':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-error-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'deposited':
        return 'success';
      case 'processing':
        return 'warning';
      case 'cooldown':
        return 'gray';
      default:
        return 'error';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Liquidation Proceeds</h1>
          <p className="text-gray-600 mt-1">
            Track liquidated positions and monitor collateral recovery
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Liquidations</p>
                <p className="text-2xl font-bold text-gray-900">{liquidations.length}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Proceeds</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatNumber(liquidations.reduce((sum, l) => sum + l.saleProceeds, 0), 0)} SOL
                </p>
              </div>
              <div className="p-3 bg-success-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net P&L</p>
                <p className={`text-2xl font-bold ${
                  liquidations.reduce((sum, l) => sum + l.pnl, 0) >= 0 
                    ? 'text-success-600' 
                    : 'text-error-600'
                }`}>
                  {liquidations.reduce((sum, l) => sum + l.pnl, 0) >= 0 ? '+' : ''}
                  {formatNumber(liquidations.reduce((sum, l) => sum + l.pnl, 0), 0)} SOL
                </p>
              </div>
              <div className="p-3 bg-warning-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatPercentage(
                    (liquidations.reduce((sum, l) => sum + l.saleProceeds, 0) /
                     liquidations.reduce((sum, l) => sum + parseFloat(l.collateralAmount), 0)) * 100
                  )}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liquidation Events</CardTitle>
        </CardHeader>
        <CardContent>
          {liquidations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Position ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Collateral</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sale Proceeds</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">P&L</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidations.map((liquidation) => (
                    <tr key={liquidation.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {liquidation.positionId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Liquidated at ${liquidation.liquidationPrice}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatNumber(parseFloat(liquidation.collateralAmount), 0)} tokens
                          </p>
                          <p className="text-sm text-gray-500">
                            Original collateral
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatNumber(liquidation.saleProceeds, 2)} SOL
                          </p>
                          <p className="text-sm text-gray-500">
                            After liquidation
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            liquidation.pnl >= 0 ? 'text-success-600' : 'text-error-600'
                          }`}>
                            {liquidation.pnl >= 0 ? '+' : ''}{formatNumber(liquidation.pnl, 2)} SOL
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {liquidation.pnl >= 0 ? 'Profit' : 'Loss'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(liquidation.status)}
                          <Badge
                            variant={getStatusVariant(liquidation.status) as any}
                            size="sm"
                          >
                            {liquidation.status.charAt(0).toUpperCase() + liquidation.status.slice(1)}
                          </Badge>
                        </div>
                        {liquidation.status === 'cooldown' && liquidation.cooldownEndsAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ends {formatDate(liquidation.cooldownEndsAt, 'relative')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {formatDate(liquidation.timestamp, 'short')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(liquidation.timestamp, 'relative')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No liquidations yet
              </h3>
              <p className="text-gray-600">
                Liquidation events will appear here when positions using your offers are liquidated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Liquidations;