import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  ExternalLink,
  AlertTriangle,
  Wallet,
  BarChart3,
  Save,
  FileText,
  Trash2,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WalletMultiButton } from '@/contexts/WalletContext';
import Badge from '@/components/ui/Badge';
import { useOffers } from '@/hooks/useOffers';
import { usePositions } from '@/hooks/usePositions';
import { useWallet } from '@/contexts/WalletContext';
import { formatPercentage, formatCurrency } from '@/utils';
import { QuickActionMenu, QuickActionItem } from '@/components/ui/QuickActionMenu';
import { GradientText, LoadingSpinner, LavarageLogo } from '@/components/brand';

const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { offers, loading: offersLoading } = useOffers({ autoRefresh: true });
  const {
    positions,
    loading: positionsLoading,
    stats: positionStats,
  } = usePositions({ autoRefresh: true });

  // Calculate dashboard metrics
  const dashboardStats = {
    totalLiquidityDeployed: offers.reduce((acc: Record<string, number>, offer) => {
      const currentExposure = parseFloat(offer.currentExposure) || 0;
      const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
      const symbol = quoteToken?.symbol ?? 'SOL';
      const decimals = quoteToken?.decimals ?? 9;
      
      if (!acc[symbol]) {
        acc[symbol] = 0;
      }
      acc[symbol] += currentExposure;
      
      return acc;
    }, { USDC: 0, SOL: 0 }),
    activeOffersCount: offers.filter((offer) => offer.active).length,
    portfolioUtilization:
      offers.length > 0
        ? offers.reduce((sum, offer) => {
            const maxExposure = parseInt(offer.maxExposure, 16) || 0;
            const currentExposure = parseInt(offer.currentExposure, 16) || 0;
            return sum + (maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0);
          }, 0) / offers.length
        : 0,
    totalInterestEarned: positionStats.totalInterestEarned as Record<string, number>,
    activePositionsCount: positionStats.activePositions,
    averageAPR:
      offers.length > 0 ? offers.reduce((sum, offer) => sum + offer.apr, 0) / offers.length : 0,
  };

  const atRiskPositions = useMemo(
    () =>
      positions.filter(
        (p) => p.status === 'active' && (p.positionLtv || 0) >= 0.75
      ).length,
    [positions]
  );

  const statCards = [
    {
      title: 'Total Liquidity Deployed',
      value: ['USDC', 'SOL']
        .map(currency => formatCurrency(dashboardStats.totalLiquidityDeployed[currency] || 0, currency))
        .join('\n'),
      icon: TrendingUp,
      trend: '+12.5%',
      trendType: 'positive' as const,
    },
    {
      title: 'Active Positions',
      value: positionStats.activePositions.toString(),
      icon: Users,
      trend: '+3',
      trendType: 'positive' as const,
    },
    {
      title: 'Positions (LTV > 75%)',
      value: atRiskPositions.toString(),
      icon: AlertTriangle,
      trend: atRiskPositions > 0 ? 'Monitor' : 'Safe',
      trendType: atRiskPositions > 0 ? ('negative' as const) : ('positive' as const),
    },
    {
      title: 'Total Pending Interest',
      value: ['USDC', 'SOL']
        .map(currency => formatCurrency(dashboardStats.totalInterestEarned[currency] || 0, currency))
        .join('\n'),
      icon: BarChart3,
      trend: '+5.2%',
      trendType: 'positive' as const,
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: React.ReactNode;
    trend?: string;
    trendType?: 'positive' | 'negative';
  }> = ({ title, value, change, changeType, icon, trend, trendType }) => (
    <div className="card-lavarage p-6 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex flex-col h-full">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 leading-tight flex-1 pr-2">{title}</p>
          <div className="p-3 rounded-full bg-gradient-to-br from-lavarage-subtle to-lavarage-orange/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <div className="text-lavarage-red">{icon}</div>
          </div>
        </div>
        
        {/* Value section */}
        <div className="flex-1 flex flex-col justify-center min-h-[60px]">
          <GradientText variant="primary" size="2xl" weight="bold" className="block whitespace-pre-line leading-tight">
            {value}
          </GradientText>
        </div>
        
        {/* Trend section (if needed in future) */}
        {/* {trend && (
          <div className="mt-2">
            <div
              className={`flex items-center text-sm ${
                trendType === 'positive'
                  ? 'text-success-600'
                  : trendType === 'negative'
                    ? 'text-error-600'
                    : 'text-gray-500'
              }`}
            >
              {trendType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : trendType === 'negative' ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : null}
              {trend}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-lavarage max-w-md mx-auto text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white shadow-lg">
              <LavarageLogo variant="mark" size="xl" priority={true} />
            </div>
          </div>
          <GradientText variant="primary" size="xl" weight="bold" as="h2" className="mb-4">
            Connect Your Wallet
          </GradientText>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Connect your Solana wallet to start managing your LAVARAGE lending positions and view
            your performance dashboard.
          </p>
          <WalletMultiButton className="btn-lavarage w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Dashboard
          </GradientText>
          <p className="text-gray-600">
            Monitor your <span className="font-semibold text-lavarage-coral">LAVARAGE</span> lending
            performance and manage your offers
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/create-offer">
            <Button variant="lavarage" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={<Icon className="h-6 w-6" />}
              trend={stat.trend}
              trendType={stat.trendType}
            />
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Offers */}
        <div className="lg:col-span-2">
          <div className="card-lavarage">
            <div className="p-6 border-b border-lavarage-orange/20">
              <div className="flex items-center justify-between">
                <GradientText variant="primary" size="lg" weight="bold">
                  Recent Offers
                </GradientText>
                <Link to="/offers">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {offersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" showLogo={true} message="Loading your offers..." />
                </div>
              ) : offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.slice(0, 5).map((offer) => (
                    <div
                      key={offer.publicKey.toString()}
                      className="flex items-center justify-between p-4 rounded-lg bg-lavarage-subtle hover:bg-lavarage-subtle/80 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-lavarage-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-sm">
                            {offer.collateralToken?.symbol?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {offer.collateralToken?.symbol || 'Unknown Token'}
                          </p>
                          <p className="text-sm text-lavarage-coral font-medium">
                            {formatPercentage(offer.apr)} APR
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {offer.maxLeverage} X
                        </p>
                        <Badge variant={offer.active ? 'lavarage' : 'gray'} size="sm">
                          {offer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-lavarage-subtle flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-lavarage-coral" />
                  </div>
                  <GradientText variant="primary" size="lg" weight="bold" className="mb-2">
                    No offers yet
                  </GradientText>
                  <p className="text-gray-600 mb-6">
                    Create your first loan offer to start earning interest with LAVARAGE
                  </p>
                  <Link to="/create-offer">
                    <Button variant="lavarage">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Offer
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card-lavarage">
            <div className="p-6 border-b border-lavarage-orange/20">
              <GradientText variant="primary" size="lg" weight="bold">
                Quick Actions
              </GradientText>
            </div>
            <div className="p-6">
              <QuickActionMenu>
                <QuickActionItem
                  icon={<Plus className="h-5 w-5" />}
                  onClick={() => (window.location.href = '/create-offer')}
                >
                  Create New Offer
                </QuickActionItem>
                <QuickActionItem
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => (window.location.href = '/positions')}
                >
                  View All Positions
                </QuickActionItem>
                <QuickActionItem
                  icon={<Activity className="h-5 w-5" />}
                  onClick={() => (window.location.href = '/liquidations')}
                >
                  Check Liquidations
                </QuickActionItem>
              </QuickActionMenu>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="card-lavarage">
            <div className="p-6 border-b border-lavarage-orange/20">
              <GradientText variant="primary" size="lg" weight="bold">
                Performance Summary
              </GradientText>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <span className="text-sm font-medium text-gray-600 mb-3 block">
                    Total Interest Earned
                  </span>
                  <div className="space-y-3">
                    {['USDC', 'SOL'].map(currency => (
                      <div
                        key={currency}
                        className="flex justify-between items-center p-3 rounded-lg bg-lavarage-subtle"
                      >
                        <span className="text-sm font-medium text-gray-700">{currency}</span>
                        <GradientText variant="primary" weight="bold">
                          {formatCurrency(dashboardStats.totalInterestEarned[currency] || 0, currency)}
                        </GradientText>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-lavarage-subtle">
                  <span className="text-sm font-medium text-gray-700">Average APR</span>
                  <GradientText variant="primary" weight="bold">
                    {formatPercentage(dashboardStats.averageAPR)}
                  </GradientText>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-lavarage-subtle">
                  <span className="text-sm font-medium text-gray-700">Total Positions</span>
                  <GradientText variant="primary" weight="bold">
                    {positionStats.totalPositions}
                  </GradientText>
                </div>
                <div className="pt-4 border-t border-lavarage-orange/20">
                  <Link to="/analytics">
                    <Button variant="lavarage" fullWidth>
                      View Detailed Analytics
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
