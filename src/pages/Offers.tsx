import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { useOffers } from '@/hooks/useOffers';
import { useWallet } from '@/contexts/WalletContext';
import { formatNumber, formatPercentage, formatDate, truncateAddress } from '@/utils';
import { OfferV2Model } from '@/types';

const Offers: React.FC = () => {
  const { connected } = useWallet();
  const { offers, loading, error, refetch, changeLTV } = useOffers({ autoRefresh: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'apr' | 'utilization'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort offers
  const filteredOffers = offers
    .filter(offer => {
      if (statusFilter !== 'all' && offer.active !== (statusFilter === 'active')) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          offer.collateralToken?.symbol?.toLowerCase().includes(term) ||
          offer.collateralToken?.name?.toLowerCase().includes(term) ||
          offer.publicKey.toString().toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'apr':
          aValue = a.apr;
          bValue = b.apr;
          break;
        case 'utilization':
          aValue = (parseInt(a.currentExposure, 16) / parseInt(a.maxExposure, 16)) * 100;
          bValue = (parseInt(b.currentExposure, 16) / parseInt(b.maxExposure, 16)) * 100;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (key: 'created' | 'apr' | 'utilization') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const getUtilization = (offer: OfferV2Model) => {
    const maxExposure = parseInt(offer.maxExposure, 16) || 0;
    const currentExposure = parseInt(offer.currentExposure, 16) || 0;
    return maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0;
  };

  const OfferCard: React.FC<{ offer: OfferV2Model }> = ({ offer }) => {
    const utilization = getUtilization(offer);
    const availableAmount = parseInt(offer.availableForOpen) / 1e9;
    const totalExposure = parseInt(offer.maxExposure, 16) / 1e9;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {offer.collateralToken?.symbol?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {offer.collateralToken?.symbol || 'Unknown Token'}
                </h3>
                <p className="text-sm text-gray-500">
                  {offer.collateralToken?.name || 'Token Name'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={offer.active ? 'success' : 'gray'}>
                {offer.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">APR</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercentage(offer.apr)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilization</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-gray-900">
                  {formatPercentage(utilization, 1)}
                </p>
                {utilization > 80 ? (
                  <TrendingUp className="h-4 w-4 text-success-500" />
                ) : utilization > 50 ? (
                  <Activity className="h-4 w-4 text-warning-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(availableAmount, 2)} SOL
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Exposure</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(totalExposure, 2)} SOL
              </p>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Utilization</span>
              <span>{formatPercentage(utilization, 1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  utilization > 80
                    ? 'bg-success-500'
                    : utilization > 50
                    ? 'bg-warning-500'
                    : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Created {formatDate(offer.createdAt, 'relative')}
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                {offer.active ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
              Connect your wallet to view and manage your loan offers.
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
          <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
          <p className="text-gray-600 mt-1">
            Manage your loan offers and track their performance
          </p>
        </div>
        <Link to="/offers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search offers by token symbol, name, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="secondary" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              <p className="text-sm text-gray-600">Total Offers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {offers.filter(o => o.active).length}
              </p>
              <p className="text-sm text-gray-600">Active Offers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {offers.length > 0 ? formatPercentage(offers.reduce((sum, o) => sum + o.apr, 0) / offers.length) : '0%'}
              </p>
              <p className="text-sm text-gray-600">Avg APR</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">
                {offers.length > 0 ? formatPercentage(offers.reduce((sum, o) => sum + getUtilization(o), 0) / offers.length) : '0%'}
              </p>
              <p className="text-sm text-gray-600">Avg Utilization</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 w-8 bg-gray-200 rounded"></div>
                      <div className="h-5 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <OfferCard key={offer.publicKey.toString()} offer={offer} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No offers found' : 'No offers yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first loan offer to start earning interest on your crypto'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/offers/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Offers;