import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus } from 'lucide-react';
import { useOffers } from '@/hooks/useOffers';
import { useError } from '@/contexts/ErrorContext';
import { apiService } from '@/services/api';
import { TokenModel } from '@/types';
import { isValidSolanaAddress } from '@/utils';
import { QUOTE_TOKENS, getQuoteTokenAddress, QUOTE_TOKEN_SYMBOLS } from '@/utils/tokens';

const CreateOffer: React.FC = () => {
  const { createOffer } = useOffers();
  const { handleError } = useError();

  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [quoteToken, setQuoteToken] = useState('SOL');
  const [baseToken, setBaseToken] = useState('');
  const [tokenData, setTokenData] = useState<TokenModel | null>(null);
  const [baseTokenError, setBaseTokenError] = useState<string | null>(null);
  const [interestRateError, setInterestRateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      // Clear previous errors
      setBaseTokenError(null);
      
      // If no base token, clear everything
      if (!baseToken) {
        setTokenData(null);
        return;
      }
      
      // Validate address format first
      if (!isValidSolanaAddress(baseToken)) {
        setBaseTokenError('Please enter a valid Solana address');
        setTokenData(null);
        return;
      }
      
      try {
        const data = await apiService.getTokenMetadata(baseToken);
        setTokenData(data);
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token metadata';
        setBaseTokenError(errorMessage);
        setTokenData(null);

        // Handle LavaRock NFT errors globally
        handleError(errorMessage);
      }
    };
    
    fetchMetadata();
  }, [baseToken, handleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing interest rate errors first
    setInterestRateError(null);

    const parsedAmount = parseFloat(amount);
    const parsedInterest = parseFloat(interestRate);

    // Validate that values are numbers
    if (isNaN(parsedAmount)) {
      handleError('Please enter a valid amount');
      return;
    }

    if (isNaN(parsedInterest)) {
      setInterestRateError('Please enter a valid number');
      return;
    }

    // Validate interest rate range and integer
    if (parsedInterest < 1 || parsedInterest > 255 || !Number.isInteger(parsedInterest)) {
      setInterestRateError('Please enter a valid integer value from 1 to 255');
      return;
    }

    // Validate base token
    if (!baseToken || baseTokenError || !tokenData) {
      handleError('Please enter a valid base token address');
      return;
    }

    // If all validation passes, create the offer
    try {
      await createOffer({
        collateralToken: baseToken,
        maxExposure: parsedAmount * 10 ** (quoteToken === 'SOL' ? 9 : 6),
        interestRate: Math.round(parsedInterest),
        quoteToken: getQuoteTokenAddress(quoteToken as keyof typeof QUOTE_TOKENS),
        tokenData: tokenData || undefined,
      });
    } catch (error) {
      // Error is already handled by the useOffers hook
      // This catch block prevents the error from becoming uncaught
      console.error(error);
    }
  };

  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Offer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Loan Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Token</label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={quoteToken}
                  onChange={(e) => setQuoteToken(e.target.value)}
                >
                  {QUOTE_TOKEN_SYMBOLS.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Token Address
                </label>
                <Input
                  variant="message"
                  placeholder="Enter address"
                  value={baseToken}
                  onChange={(e) => setBaseToken(e.target.value.trim())}
                />
                {tokenData && (
                  <p className="mt-1 text-sm text-gray-600">
                    {tokenData.name} ({tokenData.symbol})
                  </p>
                )}
                {baseTokenError && (
                  <p className="mt-1 text-sm text-red-600">{baseTokenError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Exposure (Quote Token)
                </label>
                <Input
                  variant="message"
                  type="number"
                  placeholder="Enter amount"
                  min="0"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (APR %)
                </label>
                <Input
                  variant="message"
                  type="number"
                  placeholder="Enter interest rate"
                  value={interestRate}
                  step="1"
                  onChange={(e) => {
                    const value = e.target.value;
                    setInterestRate(value);
                    
                    // Real-time validation
                    if (value && !isNaN(Number(value))) {
                      const parsedValue = parseFloat(value);
                      if (parsedValue < 1 || parsedValue > 255 || !Number.isInteger(parsedValue)) {
                        setInterestRateError('Please enter a valid integer value from 1 to 255');
                      } else {
                        setInterestRateError(null);
                      }
                    } else if (value) {
                      setInterestRateError('Please enter a valid number');
                    } else {
                      setInterestRateError(null);
                    }
                  }}
                />
                {interestRateError && (
                  <p className="mt-1 text-sm text-red-600">{interestRateError}</p>
                )}
              </div>
            </div>
            <Button className="w-full" type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;
