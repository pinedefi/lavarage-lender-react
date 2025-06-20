import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { WalletMultiButton } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WalletContext';
import { usePool } from '@/hooks/usePool';
import { formatNumber } from '@/utils';
import { DollarSign } from 'lucide-react';
import { QUOTE_TOKENS } from '@/utils/tokens';
import { RequireNFT } from '@/components/auth/RequireNFT';

const Balances: React.FC = () => {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'USDC'>('SOL');
  const {
    balance: solBalance,
    loading: solLoading,
    deposit: depositSol,
    withdraw: withdrawSol,
  } = usePool({ quoteToken: 'So11111111111111111111111111111111111111112' });
  const {
    balance: usdcBalance,
    loading: usdcLoading,
    deposit: depositUsdc,
    withdraw: withdrawUsdc,
  } = usePool({ quoteToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' });
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    if (!amount) return;
    if (selectedToken === 'SOL') {
      await depositSol(parseFloat(amount));
    } else {
      await depositUsdc(parseFloat(amount));
    }
    setAmount('');
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    if (selectedToken === 'SOL') {
      await withdrawSol(parseFloat(amount));
    } else {
      await withdrawUsdc(parseFloat(amount));
    }
    setAmount('');
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to manage pool funds.</p>
            <WalletMultiButton className="w-full !bg-primary-600 !rounded-md hover:!bg-primary-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Balances</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOL Balance Card */}
        <Card className={selectedToken === 'SOL' ? 'ring-2 ring-primary-500' : ''}>
          <CardHeader>
            <CardTitle>SOL Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-4">
              {solLoading ? 'Loading...' : `${formatNumber(solBalance, 3)} SOL`}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  value={selectedToken === 'SOL' ? amount : ''}
                  onChange={(e) => {
                    if (selectedToken === 'SOL') {
                      setAmount(e.target.value);
                    }
                  }}
                  disabled={selectedToken !== 'SOL'}
                />
                <RequireNFT
                  fallback={
                    <div className="flex space-x-2">
                      <Button disabled title="Lavarock NFT required">
                        Deposit
                      </Button>
                      <Button variant="secondary" disabled title="Lavarock NFT required">
                        Withdraw
                      </Button>
                    </div>
                  }
                >
                  <Button onClick={handleDeposit} disabled={selectedToken !== 'SOL'}>
                    Deposit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleWithdraw}
                    disabled={selectedToken !== 'SOL'}
                  >
                    Withdraw
                  </Button>
                </RequireNFT>
              </div>
              <RequireNFT
                fallback={
                  <p className="text-xs text-amber-600">
                    ⚠️ Lavarock NFT required for deposits/withdrawals
                  </p>
                }
              >
                <div></div>
              </RequireNFT>
            </div>
          </CardContent>
        </Card>

        {/* USDC Balance Card */}
        <Card className={selectedToken === 'USDC' ? 'ring-2 ring-primary-500' : ''}>
          <CardHeader>
            <CardTitle>USDC Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-4">
              {usdcLoading ? 'Loading...' : `${formatNumber(usdcBalance, 3)} USDC`}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  value={selectedToken === 'USDC' ? amount : ''}
                  onChange={(e) => {
                    if (selectedToken === 'USDC') {
                      setAmount(e.target.value);
                    }
                  }}
                  disabled={selectedToken !== 'USDC'}
                />
                <RequireNFT
                  fallback={
                    <div className="flex space-x-2">
                      <Button disabled title="Lavarock NFT required">
                        Deposit
                      </Button>
                      <Button variant="secondary" disabled title="Lavarock NFT required">
                        Withdraw
                      </Button>
                    </div>
                  }
                >
                  <Button onClick={handleDeposit} disabled={selectedToken !== 'USDC'}>
                    Deposit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleWithdraw}
                    disabled={selectedToken !== 'USDC'}
                  >
                    Withdraw
                  </Button>
                </RequireNFT>
              </div>
              <RequireNFT
                fallback={
                  <p className="text-xs text-amber-600">
                    ⚠️ Lavarock NFT required for deposits/withdrawals
                  </p>
                }
              >
                <div></div>
              </RequireNFT>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Selection */}
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          variant={selectedToken === 'SOL' ? 'default' : 'secondary'}
          onClick={() => {
            setSelectedToken('SOL');
            setAmount('');
          }}
        >
          SOL
        </Button>
        <Button
          variant={selectedToken === 'USDC' ? 'default' : 'secondary'}
          onClick={() => {
            setSelectedToken('USDC');
            setAmount('');
          }}
        >
          USDC
        </Button>
      </div>
    </div>
  );
};

export default Balances;
