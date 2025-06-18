import React, { useState, useEffect } from 'react';
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
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy,
  Check,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WalletMultiButton } from '@/contexts/WalletContext';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useOffers } from '@/hooks/useOffers';
import { useWallet } from '@/contexts/WalletContext';
import { formatNumber, formatPercentage, formatDate, truncateAddress, getRiskLevel } from '@/utils';
import { OfferV2Model } from '@/types';
import { copyToClipboard } from '@/utils';

const Offers: React.FC = () => {
  const { connected } = useWallet();
  const { offers, loading, error, refetch, changeLTV, updateOffer } = useOffers({
    autoRefresh: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<
    'created' | 'apr' | 'utilization' | 'exposure' | 'token' | 'available'
  >('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOffer, setSelectedOffer] = useState<OfferV2Model | null>(null);
  const [pauseOffer, setPauseOffer] = useState<OfferV2Model | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyToClipboard = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
    }
  };

  // Filter and sort offers
  const filteredOffers = offers
    .filter((offer) => {
      if (statusFilter !== 'all' && offer.active !== (statusFilter === 'active')) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          offer.collateralToken?.symbol?.toLowerCase().includes(term) ||
          offer.collateralToken?.name?.toLowerCase().includes(term) ||
          offer.collateralToken?.address?.toLowerCase().includes(term)
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
        case 'exposure':
          aValue = parseInt(a.maxExposure, 16);
          bValue = parseInt(b.maxExposure, 16);
          break;
        case 'available':
          aValue = parseInt(a.availableForOpen);
          bValue = parseInt(b.availableForOpen);
          break;
        case 'token':
          aValue = a.collateralToken?.symbol || 'Z';
          bValue = b.collateralToken?.symbol || 'Z';
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (
    key: 'created' | 'apr' | 'utilization' | 'exposure' | 'token' | 'available'
  ) => {
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

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600" />
    );
  };

  const OfferModal: React.FC<{
    offer: OfferV2Model | null;
    onClose: () => void;
  }> = ({ offer, onClose }) => {
    const [apr, setApr] = useState('');
    const [exposure, setExposure] = useState('');
    const [ltv, setLtv] = useState('');

    useEffect(() => {
      if (offer) {
        const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
        const decimals = quoteToken?.decimals ?? 9;
        setApr(offer.apr.toString());
        setExposure((parseInt(offer.maxExposure, 16) / 10 ** decimals).toString());
        // Convert decimal to percentage for display (0.75 -> 75)
        setLtv(((offer.targetLtv || 0.75) * 100).toString());
      }
    }, [offer]);

    if (!offer) return null;

    const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
    const symbol = quoteToken?.symbol ?? 'SOL';

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateOffer({
        nodeWallet: offer.nodeWallet.toString(),
        collateralToken: offer.collateralToken?.address || '',
        quoteToken:
          typeof offer.quoteToken === 'string' ? offer.quoteToken : offer.quoteToken.address,
        maxExposure: parseFloat(exposure),
        interestRate: parseFloat(apr),
      });
      onClose();
    };

    const handleLtvSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Convert percentage to decimal for API (75 -> 0.75)
      await changeLTV(offer.publicKey.toString(), parseFloat(ltv) / 100);
      onClose();
    };

    return (
      <Modal open={!!offer} onClose={onClose}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Edit Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">APR (%)</label>
              <Input
                type="number"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Exposure ({symbol})
              </label>
              <Input
                type="number"
                value={exposure}
                onChange={(e) => setExposure(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
          <hr />
          <h2 className="text-xl font-semibold">Change LTV</h2>
          <form onSubmit={handleLtvSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New LTV (%)</label>
              <Input
                type="number"
                value={ltv}
                onChange={(e) => setLtv(e.target.value)}
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g., 75 for 75%"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Update LTV
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  const PauseModal: React.FC<{
    offer: OfferV2Model | null;
    onClose: () => void;
  }> = ({ offer, onClose }) => {
    if (!offer) return null;

    const handlePause = async () => {
      await changeLTV(offer.publicKey.toString(), 0);
      onClose();
    };

    return (
      <Modal open={!!offer} onClose={onClose}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Pause Offer</h2>
          <p>Are you sure you want to pause this offer?</p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePause}>
              Pause
            </Button>
          </div>
        </div>
      </Modal>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view and manage your loan offers.
            </p>
            <WalletMultiButton className="w-full !bg-primary-600 !rounded-md hover:!bg-primary-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Offers</h1>
        <Link to="/create-offer">
          <Button variant="glass" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle>Your Offers</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredOffers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('token')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Token</span>
                        {getSortIcon('token')}
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
                      onClick={() => handleSort('utilization')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Utilization</span>
                        {getSortIcon('utilization')}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('exposure')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Max Exposure</span>
                        {getSortIcon('exposure')}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('available')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Available</span>
                        {getSortIcon('available')}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">LTV</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th
                      className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        {getSortIcon('created')}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => {
                    const utilization = getUtilization(offer);
                    const quoteToken =
                      typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
                    const decimals = quoteToken?.decimals ?? 9;
                    const symbol = quoteToken?.symbol ?? 'SOL';
                    const availableAmount = parseInt(offer.availableForOpen) / 10 ** decimals;
                    const totalExposure = parseInt(offer.maxExposure, 16) / 10 ** decimals;

                    return (
                      <tr
                        key={offer.publicKey.toString()}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                              {offer.collateralToken?.logoURI ? (
                                <img
                                  src={offer.collateralToken.logoURI}
                                  alt={offer.collateralToken.symbol || 'Token'}
                                  className="h-8 w-8 rounded-lg object-cover"
                                  onError={(e) => {
                                    // Fallback to text avatar if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.className =
                                        'h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center';
                                      parent.innerHTML = `<span class="text-primary-600 font-semibold text-sm">${offer.collateralToken?.symbol?.charAt(0) || 'T'}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <span className="text-primary-600 font-semibold text-sm">
                                    {offer.collateralToken?.symbol?.charAt(0) || 'T'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {offer.collateralToken?.symbol || 'Unknown'}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {offer.collateralToken?.address
                                    ? truncateAddress(offer.collateralToken.address)
                                    : 'Unknown Address'}
                                </span>
                                {offer.collateralToken?.address && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyToClipboard(offer.collateralToken?.address || '');
                                    }}
                                    className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Copy address"
                                  >
                                    {copiedAddress === offer.collateralToken.address ? (
                                      <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">
                            {formatPercentage(offer.apr)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {formatPercentage(utilization, 1)}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
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
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">
                            {formatNumber(totalExposure, 2)} {symbol}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">
                            {formatNumber(availableAmount, 2)} {symbol}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {offer.targetLtv !== null && offer.targetLtv !== undefined
                                ? formatPercentage(offer.targetLtv * 100)
                                : 'N/A'}
                            </span>
                            {offer.targetLtv !== null && offer.targetLtv !== undefined && (
                              <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded ${getRiskLevel(offer.targetLtv).color}`}
                              >
                                {getRiskLevel(offer.targetLtv).label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={offer.active ? 'success' : 'gray'} size="sm">
                            {offer.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(offer.createdAt, 'relative')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOffer(offer)}
                              className="p-1 h-8 w-8"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPauseOffer(offer)}
                              className="p-1 h-8 w-8"
                            >
                              {offer.active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Offers Found</h3>
              <p className="mt-2 text-center text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first lending offer to start earning interest on your assets.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to="/create-offer">
                  <Button variant="glass" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <OfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
      <PauseModal offer={pauseOffer} onClose={() => setPauseOffer(null)} />
    </div>
  );
};

export default Offers;
