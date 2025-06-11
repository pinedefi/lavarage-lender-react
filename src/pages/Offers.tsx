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
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WalletMultiButton } from '@/contexts/WalletContext';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useOffers } from '@/hooks/useOffers';
import { useWallet } from '@/contexts/WalletContext';
import { formatNumber, formatPercentage, formatDate, truncateAddress } from '@/utils';
import { OfferV2Model } from '@/types';

const Offers: React.FC = () => {
  const { connected } = useWallet();
  const { offers, loading, error, refetch, changeLTV, updateOffer } = useOffers({ autoRefresh: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'apr' | 'utilization'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOffer, setSelectedOffer] = useState<OfferV2Model | null>(null);

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
      <Card
        onClick={() => setSelectedOffer(offer)}
        className="hover:shadow-md transition-shadow cursor-pointer"
      >
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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOffer(offer);
                }}
              >
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

  const OfferModal: React.FC<{ offer: OfferV2Model | null; onClose: () => void }> = ({ offer, onClose }) => {
    const [apr, setApr] = useState('');
    const [exposure, setExposure] = useState('');

    useEffect(() => {
      if (offer) {
        setApr(offer.apr.toString());
        setExposure((parseInt(offer.maxExposure, 16) / 1e9).toString());
      }
    }, [offer]);

    if (!offer) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateOffer({
        nodeWallet: offer.nodeWallet.toString(),
        collateralToken: offer.collateralToken?.address || '',
        quoteToken: typeof offer.quoteToken === 'string' ? offer.quoteToken : offer.quoteToken.address,
        maxExposure: parseFloat(exposure),
        interestRate: parseFloat(apr),
      });
      onClose();
    };

    return (
      <Modal open={!!offer} onClose={onClose}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Edit Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">APR (%)</label>
              <Input type="number" value={apr} onChange={(e) => setApr(e.target.value)} step="0.1" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Exposure (SOL)</label>
              <Input type="number" value={exposure} onChange={(e) => setExposure(e.target.value)} step="0.1" min="0" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Offers</h1>
        <Button variant="primary" asChild>
          <Link to="/create-offer">
            <Plus className="mr-2 h-4 w-4" />
            Create Offer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.publicKey.toString()} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Active Offers</h3>
              <p className="mt-2 text-center text-gray-600">
                Create your first lending offer to start earning interest on your assets.
              </p>
              <Button variant="primary" className="mt-4" asChild>
                <Link to="/create-offer">Create Offer</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <OfferModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </div>
  );
};

export default Offers;