import React from 'react';
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
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useOffers } from '@/hooks/useOffers';
import { usePositions } from '@/hooks/usePositions';
import { useWallet } from '@/contexts/WalletContext';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/utils';

const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { offers, loading: offersLoading } = useOffers({ autoRefresh: true });
  const { positions, loading: positionsLoading, stats: positionStats } = usePositions({ autoRefresh: true });

  // Calculate dashboard metrics
  const dashboardStats = {
    totalLiquidityDeployed: offers.reduce((sum, offer) => {
      const currentExposure = parseInt(offer.currentExposure, 16) || 0;
      return sum + currentExposure / 1e9; // Convert lamports to SOL
    }, 0),
    activeOffersCount: offers.filter(offer => offer.active).length,
    portfolioUtilization: offers.length > 0 ? 
      offers.reduce((sum, offer) => {
        const maxExposure = parseInt(offer.maxExposure, 16) || 0;
        const currentExposure = parseInt(offer.currentExposure, 16) || 0;
        return sum + (maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0);
      }, 0) / offers.length : 0,
    totalInterestEarned: positionStats.totalInterestEarned,
    activePositionsCount: positionStats.activePositions,
    averageAPR: offers.length > 0 ? 
      offers.reduce((sum, offer) => sum + offer.apr, 0) / offers.length : 0,
  };

  const statCards = [
    {
      title: 'Total Value Locked',
      value: '1,234.56 SOL',
      change: '+12.3%',
      icon: TrendingUp,
      positive: true,
    },
    {
      title: 'Active Positions',
      value: '45',
      change: '+5',
      icon: Users,
      positive: true,
    },
    {
      title: 'At Risk Positions',
      value: '3',
      change: '-2',
      icon: AlertTriangle,
      positive: false,
    },
    {
      title: 'Total Earnings',
      value: '89.12 SOL',
      change: '+2.4%',
      icon: BarChart3,
      positive: true,
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: React.ReactNode;
  }> = ({ title, value, change, changeType, icon }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm flex items-center mt-1 ${
                changeType === 'positive' ? 'text-success-600' : 'text-error-600'
              }`}>
                {changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to start managing your lending positions
              and view your dashboard statistics.
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your lending performance and manage your offers
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Link to="/offers/create">
            <Button size="sm">
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
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  <span
                    className={
                      stat.positive ? 'text-success-600' : 'text-error-600'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Offers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Offers</CardTitle>
                <Link to="/offers">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.slice(0, 5).map((offer) => (
                    <div key={offer.publicKey.toString()} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {offer.collateralToken?.symbol?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {offer.collateralToken?.symbol || 'Unknown Token'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPercentage(offer.apr)} APR
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatNumber(parseInt(offer.availableForOpen) / 1e9, 2)} SOL
                        </p>
                        <Badge 
                          variant={offer.active ? 'success' : 'gray'} 
                          size="sm"
                        >
                          {offer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No offers yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first loan offer to start earning interest
                  </p>
                  <Link to="/offers/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Offer
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Interest Earned</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardStats.totalInterestEarned)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average APR</span>
                  <span className="font-medium">
                    {formatPercentage(dashboardStats.averageAPR)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Positions</span>
                  <span className="font-medium">
                    {statCards.length}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <Link to="/analytics">
                    <Button variant="ghost" fullWidth>
                      View Detailed Analytics
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/offers/create">
                  <Button fullWidth variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Offer
                  </Button>
                </Link>
                <Link to="/positions">
                  <Button fullWidth variant="secondary">
                    <Users className="h-4 w-4 mr-2" />
                    View All Positions
                  </Button>
                </Link>
                <Link to="/liquidations">
                  <Button fullWidth variant="secondary">
                    <Activity className="h-4 w-4 mr-2" />
                    Check Liquidations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;