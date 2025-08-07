import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { GradientText, LoadingSpinner } from '@/components/brand';
import { useOffers } from '@/hooks/useOffers';
import { useWallet } from '@/contexts/WalletContext';
import {
  formatNumber,
  formatPercentage,
  formatDate,
  truncateAddress,
  getRiskLevel,
  formatNumberForInput,
} from '@/utils';
import { OfferV2Model } from '@/types';
import { copyToClipboard } from '@/utils';

// Custom dropdown component to fix positioning issues
const StatusDropdown: React.FC<{
  value: 'all' | 'active' | 'inactive';
  onChange: (value: 'all' | 'active' | 'inactive') => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const options = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[120px] cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value as 'all' | 'active' | 'inactive');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                value === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
              }`}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable components to eliminate duplication
const TokenDisplay: React.FC<{
  token: OfferV2Model['collateralToken'];
  showAddress?: boolean;
  onCopyAddress?: (address: string) => void;
  copiedAddress?: string | null;
}> = ({ token, showAddress = true, onCopyAddress, copiedAddress }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center space-x-2 min-w-0">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
        {token?.logoURI && !imageError ? (
          <img
            src={token.logoURI}
            alt={token.symbol || 'Token'}
            className="h-8 w-8 rounded-lg object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {token?.symbol?.charAt(0) || 'T'}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 text-xs truncate">
          {token?.symbol || 'Unknown'}
        </div>
        {showAddress && (
          <div className="flex items-center space-x-1 min-w-0">
            <span className="text-xs text-gray-500 truncate">
              {token?.address ? truncateAddress(token.address) : 'Unknown Address'}
            </span>
            {token?.address && onCopyAddress && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyAddress(token.address || '');
                }}
                className="p-0.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0 ml-1"
                title="Copy token address"
              >
                {copiedAddress === token.address ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const UtilizationBar: React.FC<{ utilization: number; showPercentage?: boolean }> = ({
  utilization,
  showPercentage = true,
}) => (
  <div className="flex items-center space-x-2">
    {showPercentage && (
      <span className="font-semibold text-gray-900 text-sm">
        {formatPercentage(utilization, 1)}
      </span>
    )}
    <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
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
);

const SortableHeader: React.FC<{
  children: React.ReactNode;
  sortKey: 'created' | 'apr' | 'utilization' | 'exposure' | 'token' | 'available';
  currentSort: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: 'created' | 'apr' | 'utilization' | 'exposure' | 'token' | 'available') => void;
  className?: string;
}> = ({ children, sortKey, currentSort, sortOrder, onSort, className = '' }) => (
  <th
    className={`text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 ${className}`}
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      {currentSort !== sortKey ? (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      ) : sortOrder === 'asc' ? (
        <ChevronUp className="h-4 w-4 text-primary-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-primary-600" />
      )}
    </div>
  </th>
);

// Mobile-friendly offer card component
const OfferCard: React.FC<{
  offer: OfferV2Model;
  onEdit: (offer: OfferV2Model) => void;
  onToggle: (offer: OfferV2Model) => void;
  onCopyAddress: (address: string) => void;
  copiedAddress: string | null;
}> = ({ offer, onEdit, onToggle, onCopyAddress, copiedAddress }) => {
  const utilization = (() => {
    const maxExposure = parseFloat(offer.maxExposure) || 0;
    const currentExposure = parseFloat(offer.currentExposure) || 0;
    return maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0;
  })();

  const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
  const symbol = quoteToken?.symbol ?? 'SOL';
  const availableAmount = parseFloat(offer.availableForOpen) || 0;
  const totalExposure = parseFloat(offer.maxExposure) || 0;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-2">
          <div className="flex-1 min-w-0">
            <TokenDisplay
              token={offer.collateralToken}
              onCopyAddress={onCopyAddress}
              copiedAddress={copiedAddress}
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:space-x-1 sm:flex-shrink-0">
            <Badge variant={offer.active ? 'success' : 'gray'} size="sm" className="whitespace-nowrap">
              {offer.active ? 'Active' : 'Inactive'}
            </Badge>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(offer)}
                className="p-1 h-8 w-8 flex-shrink-0"
                title="Edit offer"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(offer)}
                className="p-1 h-8 w-8 flex-shrink-0"
                title={offer.active ? 'Pause offer' : 'Activate offer'}
              >
                {offer.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">APR</span>
            <div className="font-semibold text-gray-900">{formatPercentage(offer.apr)}</div>
          </div>
          <div>
            <span className="text-gray-500">LTV</span>
            <div className="font-semibold text-gray-900">
              {offer.targetLtv !== null && offer.targetLtv !== undefined
                ? formatPercentage(offer.targetLtv * 100)
                : 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Max Exposure</span>
            <div className="font-semibold text-gray-900">
              {formatNumber(totalExposure, 2)} {symbol}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Available</span>
            <div className="font-semibold text-gray-900">
              {formatNumber(availableAmount, 2)} {symbol}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Utilization</span>
            <span className="text-sm text-gray-500">{formatDate(offer.createdAt, 'relative')}</span>
          </div>
          <UtilizationBar utilization={utilization} />
        </div>
      </CardContent>
    </Card>
  );
};

const Offers: React.FC = () => {
  const { connected } = useWallet();
  const [selectedOffer, setSelectedOffer] = useState<OfferV2Model | null>(null);
  const [toggleOffer, setToggleOffer] = useState<OfferV2Model | null>(null);
  
  // Form state for edit modal - moved to parent to persist across re-renders
  const [editFormState, setEditFormState] = useState({
    apr: '',
    exposure: '',
    ltv: '',
    initializedOfferId: null as string | null,
    isInitialized: false
  });
  
  const { offers, loading, error, refetch, changeLTV, updateOffer } = useOffers({
    autoRefresh: !selectedOffer, // Disable auto-refresh when modal is open
    inactiveOffers: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<
    'created' | 'apr' | 'utilization' | 'exposure' | 'token' | 'available'
  >('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Handle closing the edit modal and resetting form state
  const handleCloseEditModal = useCallback(() => {
    setSelectedOffer(null);
    setEditFormState({
      apr: '',
      exposure: '',
      ltv: '',
      initializedOfferId: null,
      isInitialized: false
    });
  }, []);

  const handleCopyToClipboard = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
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
          const aMaxExposure = parseFloat(a.maxExposure) || 0;
          const aCurrentExposure = parseFloat(a.currentExposure) || 0;
          const bMaxExposure = parseFloat(b.maxExposure) || 0;
          const bCurrentExposure = parseFloat(b.currentExposure) || 0;
          aValue = aMaxExposure > 0 ? (aCurrentExposure / aMaxExposure) * 100 : 0;
          bValue = bMaxExposure > 0 ? (bCurrentExposure / bMaxExposure) * 100 : 0;
          break;
        case 'exposure':
          aValue = parseFloat(a.maxExposure) || 0;
          bValue = parseFloat(b.maxExposure) || 0;
          break;
        case 'available':
          aValue = parseFloat(a.availableForOpen) || 0;
          bValue = parseFloat(b.availableForOpen) || 0;
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

  const OfferModal: React.FC<{
    offer: OfferV2Model | null;
    onClose: () => void;
    formState: typeof editFormState;
    setFormState: React.Dispatch<React.SetStateAction<typeof editFormState>>;
  }> = ({ offer, onClose, formState, setFormState }) => {
    // Local state for immediate UI responsiveness
    const [localApr, setLocalApr] = useState('');
    const [localExposure, setLocalExposure] = useState('');
    const [localLtv, setLocalLtv] = useState('');
    const [isLocalInitialized, setIsLocalInitialized] = useState(false);

    const { apr, exposure, ltv, initializedOfferId, isInitialized } = formState;

    // Initialize both local and parent state when offer changes
    useEffect(() => {
      if (offer) {
        const offerId = offer.publicKey.toString();
        
        // Initialize form if not initialized or if different offer
        if (!isInitialized || (initializedOfferId && offerId !== initializedOfferId)) {
          const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
          const newApr = formatNumberForInput(offer.apr, 2);
          const newExposure = formatNumberForInput(parseFloat(offer.maxExposure), 2);
          const newLtv = formatNumberForInput((offer.targetLtv || 0.75) * 100, 2);
          
          // Update parent state
          setFormState({
            apr: newApr,
            exposure: newExposure,
            ltv: newLtv,
            initializedOfferId: offerId,
            isInitialized: true
          });
          
          // Update local state
          setLocalApr(newApr);
          setLocalExposure(newExposure);
          setLocalLtv(newLtv);
          setIsLocalInitialized(true);
        }
      }
    }, [offer, isInitialized, initializedOfferId, setFormState]);

    // Sync local state with parent state when parent state changes (for error recovery)
    useEffect(() => {
      if (isInitialized && !isLocalInitialized) {
        setLocalApr(apr);
        setLocalExposure(exposure);
        setLocalLtv(ltv);
        setIsLocalInitialized(true);
      }
    }, [apr, exposure, ltv, isInitialized, isLocalInitialized]);

    // Sync local state to parent state (for persistence)
    const syncToParent = useCallback(() => {
      setFormState(prev => ({
        ...prev,
        apr: localApr,
        exposure: localExposure,
        ltv: localLtv
      }));
    }, [localApr, localExposure, localLtv, setFormState]);

    if (!offer) return null;

    const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
    const symbol = quoteToken?.symbol ?? 'SOL';

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Sync current local values to parent state before submitting
      syncToParent();
      
      try {
        await updateOffer({
          nodeWallet: offer.nodeWallet.toString(),
          collateralToken: offer.collateralToken?.address || '',
          quoteToken:
            typeof offer.quoteToken === 'string' ? offer.quoteToken : offer.quoteToken.address,
          maxExposure: parseFloat(localExposure) * 10 ** (quoteToken?.decimals ?? 9),
          interestRate: Number(parseFloat(localApr).toFixed(0)),
        });
        // Only close modal after successful completion
        onClose();
      } catch (error) {
        console.error('Failed to update offer:', error);
        // Sync to parent for persistence on error
        syncToParent();
        // Don't close modal if there's an error, so user can retry
        return;
      }
    };

    const handleLtvSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Sync current local values to parent state before submitting
      syncToParent();
      
      try {
        const ltvValue = parseFloat(localLtv) / 100;
        await changeLTV(offer.publicKey.toString(), ltvValue);
        // Only close modal after successful completion
        onClose();
      } catch (error) {
        console.error('Failed to update LTV:', error);
        // Sync to parent for persistence on error
        syncToParent();
        // Don't close modal if there's an error, so user can retry
        return;
      }
    };

        return (
      <Modal open={!!offer} onClose={onClose}>
        <div className="card-lavarage p-3 sm:p-6 lg:p-5 space-y-3 sm:space-y-3 max-h-[90vh] overflow-y-auto">
          {/* Header with improved spacing for mobile */}
          <div className="pt-1 sm:pt-0">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary-100">
                <Edit3 className="h-4 w-4 text-primary-600" />
              </div>
              <GradientText variant="primary" size="xl" weight="bold" as="h2" className="text-base sm:text-xl">
                Edit Offer
              </GradientText>
            </div>
            <div className="mt-1.5 p-2 sm:p-3 rounded-lg bg-lavarage-subtle/10 border-l-4 border-lavarage-coral">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                Updates only affect new positions opened going forward.
              </p>
            </div>
          </div>
          
          {/* Current Offer Details with glass styling - more compact on mobile */}
          <div className="glass-lavarage p-2 sm:p-4 rounded-lg border border-white/20 backdrop-blur-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <div className="h-2 w-2 bg-lavarage-coral rounded-full mr-2"></div>
              Current Offer Details
            </h3>
            {/* Mobile: Show only essential details in a compact row */}
            <div className="block sm:hidden">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 min-w-0 flex-1">
                  <TokenDisplay token={offer.collateralToken} showAddress={false} />
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-gray-500">APR</div>
                    <div className="font-bold text-gray-900">{formatPercentage(offer.apr)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">LTV</div>
                    <div className="font-bold text-gray-900">
                      {offer.targetLtv !== null && offer.targetLtv !== undefined
                        ? formatPercentage(offer.targetLtv * 100)
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Desktop: Full grid layout */}
            <div className="hidden sm:grid grid-cols-2 gap-4">
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Token</span>
                <div className="flex items-center space-x-1">
                  <TokenDisplay token={offer.collateralToken} showAddress={false} />
                </div>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">APR</span>
                <span className="text-sm font-bold text-gray-900">{formatPercentage(offer.apr)}</span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Exposure</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {formatNumber(parseFloat(offer.maxExposure), 2)} {symbol}
                </span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">LTV</span>
                <span className="text-sm font-bold text-gray-900">
                  {offer.targetLtv !== null && offer.targetLtv !== undefined
                    ? formatPercentage(offer.targetLtv * 100)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  APR <span className="text-gray-500 font-normal">(%)</span>
                </label>
                <Input
                  type="number"
                  value={localApr}
                  onChange={(e) => setLocalApr(e.target.value)}
                  step="0.1"
                  min="0"
                  className="bg-white/50 border-white/30 focus:border-lavarage-coral focus:ring-lavarage-coral/20 h-9 sm:h-10"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Max Exposure <span className="text-gray-500 font-normal">({symbol})</span>
                </label>
                <Input
                  type="number"
                  value={localExposure}
                  onChange={(e) => setLocalExposure(e.target.value)}
                  step="0.1"
                  min="0"
                  className="bg-white/50 border-white/30 focus:border-lavarage-coral focus:ring-lavarage-coral/20 h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-1 sm:pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="w-full sm:w-auto order-2 sm:order-1 hover:bg-white/20 h-8 sm:h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="lavarage" 
                className="w-full sm:w-auto order-1 sm:order-2 h-8 sm:h-10"
              >
                Save Changes
              </Button>
            </div>
          </form>

          {/* LTV Form */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-full bg-warning-100">
                <ArrowUpDown className="h-4 w-4 text-warning-600" />
              </div>
              <GradientText variant="primary" size="lg" weight="bold" as="h3" className="text-sm sm:text-lg">
                Change LTV
              </GradientText>
            </div>
            <form onSubmit={handleLtvSubmit} className="space-y-2">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  New LTV <span className="text-gray-500 font-normal">(%)</span>
                </label>
                <Input
                  type="number"
                  value={localLtv}
                  onChange={(e) => setLocalLtv(e.target.value)}
                  step="0.1"
                  min="0"
                  max="80"
                  placeholder="e.g., 75"
                  className="bg-white/50 border-white/30 focus:border-lavarage-coral focus:ring-lavarage-coral/20 h-9 sm:h-10"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button 
                  type="submit" 
                  variant="lavarage" 
                  className="w-full sm:w-auto h-8 sm:h-10"
                >
                  Update LTV
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    );
  };

  const PauseModal: React.FC<{
    offer: OfferV2Model | null;
    onClose: () => void;
  }> = ({ offer, onClose }) => {
    if (!offer) return null;

    const isActive = offer.active;
    const actionText = isActive ? 'Pause' : 'Reactivate';
    const actionDescription = isActive
      ? 'Are you sure you want to pause this offer?'
      : 'Are you sure you want to reactivate this offer? (Default LTV is 75%)';

    const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
    const symbol = quoteToken?.symbol ?? 'SOL';
    const maxExposure = parseFloat(offer.maxExposure) || 0;

    const handleAction = async () => {
      try {
        if (isActive) {
          await changeLTV(offer.publicKey.toString(), 0);
        } else {
          const defaultLTV = 0.75;
          await changeLTV(offer.publicKey.toString(), defaultLTV);
        }
      } catch (error) {
        console.error('Failed to toggle offer:', error);
        return;
      }
      onClose();
    };

    return (
      <Modal open={!!offer} onClose={onClose}>
        <div className="card-lavarage p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-1.5">
            <div className={`p-3 rounded-full ${isActive ? 'bg-warning-100' : 'bg-success-100'}`}>
              {isActive ? (
                <Pause className="h-6 w-6 text-warning-600" />
              ) : (
                <Play className="h-6 w-6 text-success-600" />
              )}
            </div>
            <div>
              <GradientText variant="primary" size="lg" weight="bold" as="h3">
                {actionText} Offer
              </GradientText>
            </div>
          </div>

          {/* Offer Details */}
          <div className="glass-lavarage p-3 sm:p-4 rounded-lg border border-white/20 backdrop-blur-sm">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <div className="h-2 w-2 bg-lavarage-coral rounded-full mr-2"></div>
              Offer Details
            </h4>
            
            {/* Mobile: Stacked layout for better readability */}
            <div className="block sm:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Token</span>
                <div className="flex items-center space-x-1 max-w-[60%]">
                  <TokenDisplay token={offer.collateralToken} showAddress={false} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">APR</span>
                <span className="text-sm font-bold text-gray-900">{formatPercentage(offer.apr)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Exposure</span>
                <span className="text-xs font-bold text-gray-900">
                  {formatNumber(maxExposure, 2)} {symbol}
                </span>
              </div>
            </div>
            
            {/* Desktop: Grid layout */}
            <div className="hidden sm:grid grid-cols-3 gap-4">
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Token</span>
                <div className="flex items-center space-x-1">
                  <TokenDisplay token={offer.collateralToken} showAddress={false} />
                </div>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">APR</span>
                <span className="text-sm font-bold text-gray-900">{formatPercentage(offer.apr)}</span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Exposure</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumber(maxExposure, 2)} {symbol}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-lavarage-coral">
            <p className="text-gray-900 font-medium">{actionDescription}</p>
            <p className="text-sm text-gray-600 mt-2">
              {isActive
                ? 'This will temporarily stop new loans from being created against this offer.'
                : 'This will reactivate the offer and allow new loans to be created.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="px-6 w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAction} className="px-6 w-full sm:w-auto">
              {isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Offer
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Reactivate Offer
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6 sm:p-8">
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
    <div className="card-glass p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:h-auto h-screen flex flex-col">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 lg:flex-shrink lg:flex-grow-0 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <GradientText variant="primary" size="3xl" weight="bold" as="h1" className="text-2xl sm:text-3xl">
            Loan Offers
          </GradientText>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage your <span className="font-semibold text-lavarage-coral">LAVARAGE</span> loan
            offers and track performance
          </p>
        </div>
        <Link to="/create-offer" className="w-full sm:w-auto">
          <Button variant="glass" size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </Link>
      </div>

      <Card className="lg:block flex flex-col flex-1 min-h-0 lg:min-h-[80vh]">
        <CardHeader className="lg:block flex-shrink-0">
          <div className="flex flex-col space-y-4">
            <CardTitle>Your Offers</CardTitle>
            
            {/* Responsive Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 sm:flex-initial">
                  <StatusDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="lg:block flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" showLogo={true} message="Loading offers data..." />
            </div>
          ) : filteredOffers.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <SortableHeader
                        sortKey="token"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Token
                      </SortableHeader>
                      <SortableHeader
                        sortKey="apr"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        APR
                      </SortableHeader>
                      <SortableHeader
                        sortKey="utilization"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Utilization
                      </SortableHeader>
                      <SortableHeader
                        sortKey="exposure"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Max Exposure
                      </SortableHeader>
                      <SortableHeader
                        sortKey="available"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Available
                      </SortableHeader>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">LTV</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <SortableHeader
                        sortKey="created"
                        currentSort={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Created
                      </SortableHeader>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => {
                      const utilization = (() => {
                        const maxExposure = parseFloat(offer.maxExposure) || 0;
                        const currentExposure = parseFloat(offer.currentExposure) || 0;
                        return maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0;
                      })();
                      const quoteToken = typeof offer.quoteToken === 'object' ? offer.quoteToken : null;
                      const symbol = quoteToken?.symbol ?? 'SOL';
                      const availableAmount = parseFloat(offer.availableForOpen) || 0;
                      const totalExposure = parseFloat(offer.maxExposure) || 0;

                      return (
                        <tr
                          key={offer.publicKey.toString()}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <TokenDisplay
                              token={offer.collateralToken}
                              onCopyAddress={handleCopyToClipboard}
                              copiedAddress={copiedAddress}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-900">
                              {formatPercentage(offer.apr)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <UtilizationBar utilization={utilization} />
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
                                onClick={() => setToggleOffer(offer)}
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

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden">
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.publicKey.toString()}
                    offer={offer}
                    onEdit={setSelectedOffer}
                    onToggle={setToggleOffer}
                    onCopyAddress={handleCopyToClipboard}
                    copiedAddress={copiedAddress}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Offers Found</h3>
              <p className="mt-2 text-center text-gray-600 max-w-md">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first loan offer to start earning interest on your assets.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to="/create-offer" className="mt-4 w-full sm:w-auto">
                  <Button variant="glass" size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <OfferModal 
        offer={selectedOffer} 
        onClose={handleCloseEditModal}
        formState={editFormState}
        setFormState={setEditFormState}
      />
      <PauseModal offer={toggleOffer} onClose={() => setToggleOffer(null)} />
    </div>
  );
};

export default Offers;
