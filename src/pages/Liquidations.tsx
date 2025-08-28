import React, { useState, useEffect, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GradientText, LoadingSpinner } from '@/components/brand';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useWallet, WalletMultiButton } from '@/contexts/WalletContext';
import { useLiquidations } from '@/hooks/useLiquidations';
import { useOffers } from '@/hooks/useOffers';
import { useError } from '@/contexts/ErrorContext';
import { apiService } from '@/services/api';
import { AlertTriangle, Activity, Shield, RefreshCw, ExternalLink, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { LiquidationData, OfferV2Model, TokenModel } from '@/types';

// Types for the liquidation row data
interface LiquidationRowData {
  liquidation: LiquidationData;
  claimStatus: ReturnType<typeof getClaimStatus>;
  tokenInfo: ReturnType<typeof getTokenInfo>;
}

// Reusable LiquidationRow component
const LiquidationRow: React.FC<{
  liquidation: LiquidationData;
  variant: 'desktop' | 'mobile';
  claimStatus: ReturnType<typeof getClaimStatus>;
  tokenInfo: ReturnType<typeof getTokenInfo>;
  formatAmount: (amount: string, decimals?: number) => string;
  formatDate: (dateString: string) => string;
  formatDateMobile: (dateString: string) => string;
  shortenAddress: (address: string) => string;
}> = ({ 
  liquidation, 
  variant, 
  claimStatus, 
  tokenInfo, 
  formatAmount, 
  formatDate, 
  formatDateMobile, 
  shortenAddress 
}) => {
  const StatusIcon = claimStatus.icon;

  if (variant === 'desktop') {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-3 text-sm text-gray-900">
          {formatDate(liquidation.liquidatedAt)}
        </td>
        <td className="py-3 px-3 text-sm text-gray-900">
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {shortenAddress(liquidation.position)}
            </span>
            <span className="text-xs text-gray-500">
              Offer: {shortenAddress(liquidation.offer)}
            </span>
          </div>
        </td>
        <td className="py-3 px-3 text-sm text-gray-900">
          <div className="flex flex-col">
            <span>{formatAmount(liquidation.amount.toString(), tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}</span>
          </div>
        </td>
        <td className="py-3 px-3 text-sm text-gray-900">
          <div className="flex flex-col">
            <span>{formatAmount(liquidation.soldFor.toString(), tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}</span>
          </div>
        </td>
        <td className="py-3 px-3 text-sm text-gray-900">
          <div className="flex flex-col">
            <span className={`font-semibold ${getPnLColor(liquidation.soldFor, liquidation.amount)}`}>
              {formatPnL(liquidation.soldFor, liquidation.amount, tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}
            </span>
          </div>
        </td>
        <td className="py-3 px-3 text-sm text-gray-900">
            {formatDate(liquidation.soldAt)}
        </td>
        <td className="py-3 px-3 text-sm">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs ${claimStatus.bgColor} ${claimStatus.borderColor}`}>
            <StatusIcon className={`h-3 w-3 ${claimStatus.color} flex-shrink-0`} />
            <div className={`${claimStatus.color} text-center leading-tight`}>
              <div className={`font-medium`}>
                {claimStatus.label}
              </div>
              {claimStatus.timeRemaining && (
                <div className={`font-mono text-xs leading-tight`}>
                  {claimStatus.timeRemaining}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-3 text-sm">
          <TransactionButtons liquidation={liquidation} variant="desktop" />
        </td>
      </tr>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with date and status */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatDateMobile(liquidation.liquidatedAt)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sold: {formatDateMobile(liquidation.soldAt)}
              </div>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border ${claimStatus.bgColor} ${claimStatus.borderColor}`}>
              <StatusIcon className={`h-3 w-3 ${claimStatus.color}`} />
              <span className={`text-xs font-medium ${claimStatus.color}`}>
                {claimStatus.label}
              </span>
            </div>
          </div>

          {/* Position and Offer info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Position</span>
              <span className="text-xs font-mono text-gray-900">
                {shortenAddress(liquidation.position)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Offer</span>
              <span className="text-xs font-mono text-gray-900">
                {shortenAddress(liquidation.offer)}
              </span>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-3 py-2 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-500">Borrowed</div>
              <div className="text-sm font-medium text-gray-900">
                {formatAmount(liquidation.amount.toString(), tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Sold For</div>
              <div className="text-sm font-medium text-gray-900">
                {formatAmount(liquidation.soldFor.toString(), tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Liquidation PnL</div>
              <div className={`text-sm font-medium ${getPnLColor(liquidation.soldFor, liquidation.amount)}`}>
                {formatPnL(liquidation.soldFor, liquidation.amount, tokenInfo.quoteDecimals)} {tokenInfo.quoteSymbol}
              </div>
            </div>
          </div>

          {/* Cooldown timer for mobile */}
          {claimStatus.timeRemaining && (
            <div className="text-center py-2 bg-orange-50 rounded-md">
              <div className="text-xs text-orange-600">
                Time remaining: <span className="font-mono">{claimStatus.timeRemaining}</span>
              </div>
            </div>
          )}

          {/* Transaction buttons */}
          <div className="pt-2 border-t border-gray-100">
            <TransactionButtons liquidation={liquidation} variant="mobile" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable TransactionButtons component
const TransactionButtons: React.FC<{
  liquidation: LiquidationData;
  variant: 'desktop' | 'mobile';
}> = ({ liquidation, variant }) => {
  const openExplorer = (txid: string) => {
    window.open(`https://solscan.io/tx/${txid}`, '_blank');
  };

  const buttonClass = variant === 'desktop' 
    ? "flex items-center space-x-1 text-xs"
    : "flex items-center justify-center space-x-1 text-xs px-2 py-1.5 min-w-0";

  const containerClass = variant === 'desktop'
    ? "flex space-x-2"
    : "flex gap-1";

  return (
    <div className={containerClass}>
      <Button
        variant={variant === 'desktop' ? "ghost" : "outline"}
        size="sm"
        onClick={() => openExplorer(liquidation.liquidationTxid)}
        className={buttonClass}
      >
        <span className="truncate">{variant === 'mobile' ? 'Liq' : 'Liquidation'}</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </Button>
      <Button
        variant={variant === 'desktop' ? "ghost" : "outline"}
        size="sm"
        onClick={() => openExplorer(liquidation.sellTxid)}
        className={buttonClass}
      >
        <span className="truncate">Sell</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </Button>
      {liquidation.sendTx && (
        <Button
          variant={variant === 'desktop' ? "ghost" : "outline"}
          size="sm"
          onClick={() => openExplorer(liquidation.sendTx!)}
          className={buttonClass}
        >
          <span className="truncate">Send</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </Button>
      )}
    </div>
  );
};

// Helper function to get claim status (moved outside component to avoid recreating)
const getClaimStatus = (liquidatedAt: string, liquidation: LiquidationData) => {
  const liquidationDate = new Date(liquidatedAt);
  const now = new Date();
  const diffInDays = (now.getTime() - liquidationDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (liquidation.sendTx) {
    return {
      status: 'returned' as const,
      label: 'Returned to Wallet',
      timeRemaining: null,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  } else if (diffInDays > 3) {
    return {
      status: 'processing' as const,
      label: 'Processing',
      timeRemaining: null,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
  } else {
    const cooldownEndsAt = new Date(liquidationDate.getTime() + (3 * 24 * 60 * 60 * 1000));
    const timeRemaining = cooldownEndsAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      status: 'cooldown' as const,
      label: 'Cooldown',
      timeRemaining: `${hoursRemaining}h ${minutesRemaining}m`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  } 
};

// Helper function to get token info (moved outside component to avoid recreating)
const getTokenInfo = (offer: OfferV2Model | null) => {
  if (!offer) {
    return { decimals: 6, symbol: 'Unknown', quoteDecimals: 9, quoteSymbol: 'SOL' };
  }

  const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
  const collateralToken = offer.collateralToken;

  return {
    decimals: collateralToken?.decimals ?? 6,
    symbol: collateralToken?.symbol ?? 'Unknown',
    quoteDecimals: quoteToken?.decimals ?? 9,
    quoteSymbol: quoteToken?.symbol ?? 'SOL'
  };
};

// Helper function to format PnL (Sold For - Borrowed Amount)
const formatPnL = (soldFor: number, borrowedAmount: number, decimals: number = 9) => {
  const pnl = soldFor - borrowedAmount;
  const formattedPnl = pnl / Math.pow(10, decimals);
  const sign = formattedPnl >= 0 ? '+' : '';
  return `${sign}${formattedPnl.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
};

// Helper function to get PnL color (green for positive, red for negative)
const getPnLColor = (soldFor: number, borrowedAmount: number) => {
  const pnl = soldFor - borrowedAmount;
  return pnl >= 0 ? 'text-green-600' : 'text-red-600';
};

const Liquidations: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { liquidations, loading, error, dateRange, setDateRange, refresh } = useLiquidations();
  const { offers: lenderOffers } = useOffers({ includeTokens: true, inactiveOffers: true });
  const { handleError } = useError();
  const [offerDetails, setOfferDetails] = useState<Record<string, OfferV2Model>>({});

  // Create a map of offer addresses to offer details
  const offerMap = useMemo(() => {
    const map: Record<string, OfferV2Model> = {};
    lenderOffers.forEach(offer => {
      map[offer.publicKey.toString()] = offer;
    });
    return map;
  }, [lenderOffers]);

  const getOfferDetails = (offerAddress: string): OfferV2Model | null => {
    return offerMap[offerAddress] || offerDetails[offerAddress] || null;
  };

  // Filter liquidations to only show those owned by the current user
  const userLiquidations = useMemo(() => {
    if (!publicKey) return [];
    
    // Create a set of offer addresses that the user owns
    const userOwnedOfferAddresses = new Set(
      lenderOffers.map(offer => offer.publicKey.toString())
    );
    
    return liquidations
    .filter(liquidation => {
      // Check if the liquidation's offer address is in the user's owned offers
      return userOwnedOfferAddresses.has(liquidation.offer);
    });
  }, [liquidations, publicKey, lenderOffers]);

  // Prepare liquidation data with computed values
  const liquidationRowsData = useMemo(() => {
    return userLiquidations.map(liquidation => {
      const claimStatus = getClaimStatus(liquidation.liquidatedAt, liquidation);
      const tokenInfo = getTokenInfo(getOfferDetails(liquidation.offer));
      
      return {
        liquidation,
        claimStatus,
        tokenInfo
      };
    });
  }, [userLiquidations, getOfferDetails]);

  // Fetch offer details for liquidations that don't have them in the map
  useEffect(() => {
    const fetchMissingOfferDetails = async () => {
      const missingOffers = liquidations.filter(
        liquidation => !offerMap[liquidation.offer] && !offerDetails[liquidation.offer]
      );

      if (missingOffers.length === 0) return;

      const newOfferDetails: Record<string, OfferV2Model> = {};
      
      for (const liquidation of missingOffers) {
        try {
          // Try to get the offer from the API
          const offers = await apiService.getOffers({ includeTokens: true });
          const offer = offers.find(o => o.publicKey.toString() === liquidation.offer);
          if (offer) {
            newOfferDetails[liquidation.offer] = offer;
          }
        } catch (error) {
          console.error(`Failed to fetch offer details for ${liquidation.offer}:`, error);
          // Handle LavaRock NFT errors globally
          if (error instanceof Error) {
            handleError(error.message);
          }
        }
      }

      if (Object.keys(newOfferDetails).length > 0) {
        setOfferDetails(prev => ({ ...prev, ...newOfferDetails }));
      }
    };

    fetchMissingOfferDetails();
  }, [liquidations, offerMap, offerDetails, handleError]);

  const formatAmount = (amount: string, decimals: number = 6) => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-lavarage-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-lavarage-red" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view liquidation data.
            </p>
            <WalletMultiButton className="w-full !bg-lavarage-primary !rounded-md hover:!bg-lavarage-primary/90" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-glass p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Liquidations
          </GradientText>
          <p className="text-gray-600 mt-2">
            Monitor liquidation events and their details
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DateRangePicker
            gte={dateRange.gte}
            lte={dateRange.lte}
            onDateRangeChange={setDateRange}
          />
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-lavarage-red/20 bg-lavarage-red/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-lavarage-red">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-lavarage-red" />
            <span>Liquidation Events</span>
            {loading && <LoadingSpinner size="sm" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading liquidation data...</span>
            </div>
          ) : userLiquidations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Liquidations Found</h3>
              <p className="mt-2 text-center text-gray-600">
                No liquidation events found for your offers in the selected date range.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Liquidated At</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Position</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Borrowed Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Sold For (After Fees)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Liquidation PnL</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 w-40">Sold At</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-900 w-28">Claim Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidationRowsData.map((rowData, index) => (
                      <LiquidationRow
                        key={index}
                        liquidation={rowData.liquidation}
                        variant="desktop"
                        claimStatus={rowData.claimStatus}
                        tokenInfo={rowData.tokenInfo}
                        formatAmount={formatAmount}
                        formatDate={formatDate}
                        formatDateMobile={formatDateMobile}
                        shortenAddress={shortenAddress}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {liquidationRowsData.map((rowData, index) => (
                  <LiquidationRow
                    key={index}
                    liquidation={rowData.liquidation}
                    variant="mobile"
                    claimStatus={rowData.claimStatus}
                    tokenInfo={rowData.tokenInfo}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                    formatDateMobile={formatDateMobile}
                    shortenAddress={shortenAddress}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Liquidations;
