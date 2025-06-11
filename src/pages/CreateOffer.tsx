import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { useOffers } from '@/hooks/useOffers';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { formatNumber, isValidSolanaAddress } from '@/utils';
import toast from 'react-hot-toast';

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { createOffer } = useOffers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collateralToken: '',
    maxExposure: '',
    interestRate: '',
    quoteToken: 'So11111111111111111111111111111111111111112', // SOL
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.collateralToken) {
      newErrors.collateralToken = 'Collateral token address is required';
    } else if (!isValidSolanaAddress(formData.collateralToken)) {
      newErrors.collateralToken = 'Invalid Solana address format';
    }

    if (!formData.maxExposure) {
      newErrors.maxExposure = 'Maximum exposure is required';
    } else if (parseFloat(formData.maxExposure) <= 0) {
      newErrors.maxExposure = 'Maximum exposure must be greater than 0';
    }

    if (!formData.interestRate) {
      newErrors.interestRate = 'Interest rate is required';
    } else if (parseFloat(formData.interestRate) <= 0 || parseFloat(formData.interestRate) > 1000) {
      newErrors.interestRate = 'Interest rate must be between 0 and 1000%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      await createOffer({
        collateralToken: formData.collateralToken,
        maxExposure: parseFloat(formData.maxExposure),
        interestRate: parseFloat(formData.interestRate) * 100, // Convert to basis points
        quoteToken: formData.quoteToken,
      });
      
      toast.success('Offer created successfully!');
      navigate('/offers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create loan offers and start earning interest.
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/offers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Offers
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Loan Offer</h1>
        <p className="text-gray-600 mt-1">
          Set up a new loan offer to earn interest on your crypto holdings
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Collateral Token */}
            <div>
              <Input
                label="Collateral Token Address"
                placeholder="Enter Solana token mint address"
                value={formData.collateralToken}
                onChange={(e) => handleInputChange('collateralToken', e.target.value)}
                error={errors.collateralToken}
                helperText="The token that borrowers will use as collateral for loans"
                fullWidth
              />
            </div>

            {/* Quote Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Token
              </label>
              <div className="flex items-center space-x-3">
                <Badge variant="success">SOL</Badge>
                <span className="text-sm text-gray-600">
                  Loans will be denominated in SOL
                </span>
              </div>
            </div>

            {/* Maximum Exposure */}
            <div>
              <Input
                label="Maximum Exposure (SOL)"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 100"
                value={formData.maxExposure}
                onChange={(e) => handleInputChange('maxExposure', e.target.value)}
                error={errors.maxExposure}
                helperText="Maximum amount of SOL you want to lend across all borrowers"
                fullWidth
              />
            </div>

            {/* Interest Rate */}
            <div>
              <Input
                label="Annual Interest Rate (%)"
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="e.g., 15.5"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                error={errors.interestRate}
                helperText="Annual percentage rate (APR) charged to borrowers"
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        {/* Offer Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-600" />
              <span>Offer Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collateral Token:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formData.collateralToken || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maximum Exposure:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formData.maxExposure ? `${formatNumber(parseFloat(formData.maxExposure), 2)} SOL` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Interest Rate:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formData.interestRate ? `${formatNumber(parseFloat(formData.interestRate), 2)}% APR` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quote Token:</span>
                <span className="text-sm font-medium text-gray-900">SOL</span>
              </div>
            </div>
            
            {formData.maxExposure && formData.interestRate && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-800">
                  <strong>Estimated Annual Income:</strong> {' '}
                  {formatNumber(
                    parseFloat(formData.maxExposure) * parseFloat(formData.interestRate) / 100,
                    2
                  )} SOL
                  <span className="text-primary-600 ml-1">
                    (assuming 100% utilization)
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card variant="outlined">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-warning-800 mb-1">
                  Important Considerations
                </h4>
                <ul className="text-sm text-warning-700 space-y-1">
                  <li>• Lending involves risk of borrower default and potential loss of funds</li>
                  <li>• Interest rates affect borrower demand - higher rates may reduce utilization</li>
                  <li>• Collateral token volatility can impact liquidation recovery rates</li>
                  <li>• Smart contract risks apply to all DeFi lending activities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/offers')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            loadingText="Creating Offer..."
            className="flex-1"
          >
            Create Offer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffer;