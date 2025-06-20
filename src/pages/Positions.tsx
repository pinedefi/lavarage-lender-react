import React, { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GradientText, LoadingSpinner } from '@/components/brand';
import { usePositions } from '@/hooks/usePositions';
import { useWallet, WalletMultiButton } from '@/contexts/WalletContext';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  Activity,
  ExternalLink,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PositionV3Model } from '@/types';
import { copyToClipboard, truncateAddress, formatNumber, formatPercentage } from '@/utils';

type SortField = 'borrowedAmount' | 'interest' | 'riskLevel' | 'ltv' | 'apr' | 'openDate';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'closed' | 'liquidated';

const Positions: React.FC = () => {
  const { connected } = useWallet();
  const { positions, loading, error, stats, refetch } = usePositions({
    status: 'all',
    includeInactionable: false,
    autoRefresh: true,
  });

  // State for filtering and sorting
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileView, setShowMobileView] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Helper functions
  const handleCopyToClipboard = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
    }
  };

  const openSolscan = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  const formatCurrency = (amount: string | number, symbol: string = 'USDC') => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;

    let minimumFractionDigits: number;
    let maximumFractionDigits: number;

    if (symbol === 'SOL') {
      // For SOL, allow flexible decimals - no minimum, but up to 6 maximum
      minimumFractionDigits = 0;
      maximumFractionDigits = value < 1 ? 6 : value < 10 ? 4 : 2;
    } else {
      // For USDC and other tokens, use standard currency formatting
      minimumFractionDigits = 2;
      maximumFractionDigits = 2;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);

    return `${formatted} ${symbol}`;
  };

  const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `${price.toFixed(4)}`;
  } else if (price >= 0.000001) {
    return `${price.toFixed(6)}`;
  } else if (isNaN(price)) {
    return '--';
  } else {
    // Count leading zeros after decimal point
    const leadingZeros = Math.abs(Math.floor(Math.log10(price))) - 1;
    const significantDigits = price * Math.pow(10, leadingZeros + 1);
    // Convert number to subscript
    const subscript = leadingZeros.toString().split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[parseInt(d)]).join('');
    return `0.0${subscript}${(Number(significantDigits.toFixed(4)) * 10000).toFixed(0)}`;
  }
}

  const formatAddress = (address: any) => {
    return typeof address === 'string' ? address : address.toString();
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { variant: 'primary' as const, text: 'Active' },
      repaid: { variant: 'success' as const, text: 'Repaid' },
      liquidated: { variant: 'error' as const, text: 'Liquidated' },
      sold: { variant: 'gray' as const, text: 'Sold' },
      'sold by take profit': { variant: 'lavarage' as const, text: 'Take Profit' },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      variant: 'default' as const,
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // Calculate risk level for a position
  const calculateRiskLevel = (position: PositionV3Model): 'low' | 'medium' | 'high' => {
    const currentLtv =
      typeof position.positionLtv === 'string'
        ? parseFloat(position.positionLtv)
        : position.positionLtv;
    const currentPrice =
      typeof position.currentPrice === 'number'
        ? position.currentPrice
        : parseFloat(position.currentPrice);
    const liquidationPrice =
      typeof position.liquidationPrice === 'number'
        ? position.liquidationPrice
        : parseFloat(position.liquidationPrice);

    // Calculate distance to liquidation
    const priceBuffer = ((currentPrice - liquidationPrice) / liquidationPrice) * 100;

    if (currentLtv > 0.8 || priceBuffer < 20) return 'high';
    if (currentLtv > 0.6 || priceBuffer < 40) return 'medium';
    return 'low';
  };

  const getRiskBadge = (position: PositionV3Model) => {
    // Only show risk badges for active positions
    if (position.status !== 'active') {
      return (
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500">—</span>
        </div>
      );
    }

    const riskLevel = calculateRiskLevel(position);
    const riskMap = {
      low: { variant: 'success' as const, text: 'Low Risk', icon: CheckCircle },
      medium: { variant: 'warning' as const, text: 'Medium Risk', icon: AlertCircle },
      high: { variant: 'error' as const, text: 'High Risk', icon: AlertTriangle },
    };

    const config = riskMap[riskLevel];
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <Badge variant={config.variant}>{config.text}</Badge>
      </div>
    );
  };

  // Filter and sort positions
  const filteredAndSortedPositions = useMemo(() => {
    let filtered = positions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((position) => {
        if (statusFilter === 'active') return position.status === 'active';
        if (statusFilter === 'closed')
          return ['sold', 'repaid', 'sold by take profit'].includes(position.status);
        if (statusFilter === 'liquidated') return position.status === 'liquidated';
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (position) =>
          position.collateralToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.collateralToken.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatAddress(position.traderAddress).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'borrowedAmount':
          aValue = parseFloat(a.initialBorrowQuote);
          bValue = parseFloat(b.initialBorrowQuote);
          break;
        case 'interest':
          aValue = a.interestAccrued;
          bValue = b.interestAccrued;
          break;
        case 'riskLevel':
          {
            const riskOrder = { low: 1, medium: 2, high: 3 };
            aValue = riskOrder[calculateRiskLevel(a)];
            bValue = riskOrder[calculateRiskLevel(b)];
          }
          break;
        case 'ltv':
          aValue = a.positionLtv;
          bValue = b.positionLtv;
          break;
        case 'apr':
          aValue = a.apr;
          bValue = b.apr;
          break;
        case 'openDate':
          aValue = new Date(a.openTimestamp).getTime();
          bValue = new Date(b.openTimestamp).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [positions, statusFilter, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-lavarage-coral" />
    ) : (
      <ChevronDown className="h-4 w-4 text-lavarage-coral" />
    );
  };

  // Calculate enhanced stats
  const enhancedStats = useMemo(() => {
    const activePositions = positions.filter((p) => p.status === 'active');
    const totalInterestEarned = positions.reduce((sum, p) => sum + (p.interestAccrued || 0), 0);
    const highRiskPositions = activePositions.filter(
      (p) => calculateRiskLevel(p) === 'high'
    ).length;

    return {
      ...stats,
      totalInterestEarned,
      highRiskPositions,
      averageAPR:
        activePositions.length > 0
          ? activePositions.reduce((sum, p) => sum + p.apr, 0) / activePositions.length
          : 0,
    };
  }, [positions, stats]);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-lavarage-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-lavarage-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view and monitor your lending positions.
            </p>
            <WalletMultiButton className="w-full !bg-lavarage-primary !rounded-md hover:!bg-lavarage-primary/90" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-glass p-8 space-y-6">
        <div className="flex items-center justify-between">
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Position Monitoring
          </GradientText>
        </div>

        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" showLogo={true} message="Loading position data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-8 space-y-6">
        <div className="flex items-center justify-between">
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Position Monitoring
          </GradientText>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-lavarage-red" />
              <h3 className="mt-4 text-lg font-medium">Error Loading Positions</h3>
              <p className="mt-2 text-center text-gray-600">{error}</p>
              <Button onClick={refetch} variant="lavarage" className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-glass p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Position Monitoring
          </GradientText>
          <p className="text-gray-600 mt-2">
            Track your <span className="font-semibold text-lavarage-coral">LAVARAGE</span> lending
            risk and returns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowMobileView(!showMobileView)}
            variant="outline"
            className="md:hidden"
          >
            {showMobileView ? 'Table View' : 'Card View'}
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card-lavarage p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-2">Total Positions</p>
              <GradientText variant="primary" size="xl" weight="bold">
                {enhancedStats.totalPositions}
              </GradientText>
            </div>
            <div className="p-2 md:p-4 rounded-full bg-lavarage-primary">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-lavarage p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-2">Interest Earned</p>
              <GradientText variant="primary" size="xl" weight="bold">
                ${enhancedStats.totalInterestEarned.toFixed(2)}
              </GradientText>
            </div>
            <div className="p-2 md:p-4 rounded-full bg-lavarage-primary">
              <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-lavarage p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-2">Avg APR</p>
              <GradientText variant="primary" size="xl" weight="bold">
                {enhancedStats.averageAPR.toFixed(1)}%
              </GradientText>
            </div>
            <div className="p-2 md:p-4 rounded-full bg-lavarage-primary">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-lavarage p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-2">High Risk</p>
              <GradientText variant="primary" size="xl" weight="bold">
                {enhancedStats.highRiskPositions}
              </GradientText>
            </div>
            <div className="p-2 md:p-4 rounded-full bg-lavarage-red">
              <Shield className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <span>Positions ({filteredAndSortedPositions.length})</span>
            </CardTitle>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-3 py-2 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lavarage-coral focus:border-transparent bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="liquidated">Liquidated</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAndSortedPositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Positions Found</h3>
              <p className="mt-2 text-center text-gray-600">
                {positions.length === 0
                  ? "You don't have any lending positions yet."
                  : 'No positions match your current filters.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('openDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Asset</span>
                          {getSortIcon('openDate')}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('borrowedAmount')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Borrowed</span>
                          {getSortIcon('borrowedAmount')}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('ltv')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>LTV</span>
                          {getSortIcon('ltv')}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('apr')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>APR</span>
                          {getSortIcon('apr')}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('interest')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Interest</span>
                          {getSortIcon('interest')}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('riskLevel')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Risk</span>
                          {getSortIcon('riskLevel')}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPositions.map((position) => {
                      const currentPrice =
                        position.positionValue.valueInQuoteToken / Number(position.initialPositionBase);
                      const liquidationPrice =
                        typeof position.liquidationPrice === 'number'
                          ? position.liquidationPrice
                          : parseFloat(position.liquidationPrice);
                      const priceBuffer =
                        ((currentPrice - liquidationPrice) / liquidationPrice) * 100;

                      return (
                        <tr
                          key={formatAddress(position.positionAddress)}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {position.collateralToken.symbol}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {truncateAddress(position.collateralToken.address)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyToClipboard(position.collateralToken.address);
                                  }}
                                  className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                                  title="Copy address"
                                >
                                  {copiedAddress === position.collateralToken.address ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(
                                position.initialBorrowQuote,
                                position.quoteToken.symbol
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatPrice(currentPrice)} current
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">
                              {formatPercentage(
                                typeof position.positionLtv === 'string'
                                  ? parseFloat(position.positionLtv) * 100
                                  : position.positionLtv * 100
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatPrice(liquidationPrice)} liq
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-lavarage-coral">
                              {formatPercentage(
                                typeof position.apr === 'number'
                                  ? position.apr
                                  : parseFloat(position.apr)
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(position.interestAccrued, position.quoteToken.symbol)}
                            </div>
                          </td>
                          <td className="py-4 px-4">{getRiskBadge(position)}</td>
                          <td className="py-4 px-4">{getStatusBadge(position.status)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSolscan(formatAddress(position.positionAddress));
                                }}
                                className="text-lavarage-coral hover:text-lavarage-coral/80 transition-colors"
                                title="View on Solscan"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredAndSortedPositions.map((position) => {
                  const currentPrice =
                    typeof position.currentPrice === 'number'
                      ? position.currentPrice
                      : parseFloat(position.currentPrice);
                  const liquidationPrice =
                    typeof position.liquidationPrice === 'number'
                      ? position.liquidationPrice
                      : parseFloat(position.liquidationPrice);
                  const priceBuffer = ((currentPrice - liquidationPrice) / liquidationPrice) * 100;

                  return (
                    <div
                      key={formatAddress(position.positionAddress)}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">
                            {position.collateralToken.symbol}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">
                              {truncateAddress(position.collateralToken.address)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(position.collateralToken.address);
                              }}
                              className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                              title="Copy address"
                            >
                              {copiedAddress === position.collateralToken.address ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>
                        {getStatusBadge(position.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">Borrowed</div>
                          <div className="font-semibold">
                            {formatCurrency(
                              position.initialBorrowQuote,
                              position.quoteToken.symbol
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">LTV</div>
                          <div className="font-semibold">
                            {formatPercentage(
                              typeof position.positionLtv === 'string'
                                ? parseFloat(position.positionLtv) * 100
                                : position.positionLtv * 100
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">APR</div>
                          <div className="font-semibold text-lavarage-coral">
                            {formatPercentage(
                              typeof position.apr === 'number'
                                ? position.apr
                                : parseFloat(position.apr)
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Interest</div>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(position.interestAccrued, position.quoteToken.symbol)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        {getRiskBadge(position)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSolscan(formatAddress(position.positionAddress));
                          }}
                          className="flex items-center space-x-1 text-lavarage-coral hover:text-lavarage-coral/80 text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View on Solscan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Positions;
