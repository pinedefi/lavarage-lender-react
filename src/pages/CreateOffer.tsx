import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus } from 'lucide-react';
import { useOffers } from '@/hooks/useOffers';
import { apiService } from '@/services/api';
import { TokenModel } from '@/types';
import { isValidSolanaAddress } from '@/utils';
import { QUOTE_TOKENS, getQuoteTokenAddress, QUOTE_TOKEN_SYMBOLS } from '@/utils/tokens';
import { RequireNFT } from '@/components/auth/RequireNFT';

const CreateOffer: React.FC = () => {
  const { createOffer } = useOffers();

  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [quoteToken, setQuoteToken] = useState('SOL');
  const [baseToken, setBaseToken] = useState('');
  const [tokenData, setTokenData] = useState<TokenModel | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isValidSolanaAddress(baseToken)) {
        setTokenData(null);
        return;
      }
      try {
        const data = await apiService.getTokenMetadata(baseToken);
        setTokenData(data);
        setMetaError(null);
      } catch (err) {
        console.error(err);
        setMetaError('Failed to fetch token metadata');
        setTokenData(null);
      }
    };
    if (baseToken) {
      fetchMetadata();
    } else {
      setTokenData(null);
      setMetaError(null);
    }
  }, [baseToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOffer({
      collateralToken: baseToken,
      maxExposure: parseFloat(amount) * 10 ** (quoteToken === "SOL" ? 9 : 6),
      interestRate:  Number(parseFloat(interestRate).toFixed(0)),
      quoteToken: getQuoteTokenAddress(quoteToken as keyof typeof QUOTE_TOKENS),
      tokenData: tokenData || undefined,
    });
  };

  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Offer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Lending Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Exposure (Quote Token)
                </label>
                <Input
                  variant="message"
                  type="number"
                  placeholder="Enter amount to lend"
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
                  placeholder="Enter annual interest rate"
                  min="0"
                  max="255"
                  step="1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
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
                  placeholder="Enter base token address"
                  value={baseToken}
                  onChange={(e) => setBaseToken(e.target.value.trim())}
                />
                {tokenData && (
                  <p className="mt-1 text-sm text-gray-600">
                    {tokenData.name} ({tokenData.symbol})
                  </p>
                )}
                {metaError && <p className="mt-1 text-sm text-error-600">{metaError}</p>}
              </div>
            </div>
            <RequireNFT
              fallback={
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    ⚠️ You need a Lavarock NFT to create offers. You can still view existing offers
                    and data.
                  </p>
                </div>
              }
            >
              <Button className="w-full" type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </RequireNFT>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;
