import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { WalletMultiButton } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WalletContext';
import { usePool } from '@/hooks/usePool';
import { formatNumber } from '@/utils';
import { DollarSign } from 'lucide-react';

const Balances: React.FC = () => {
  const { connected } = useWallet();
  const { balance, loading, deposit, withdraw } = usePool();
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    if (!amount) return;
    await deposit(parseFloat(amount));
    setAmount('');
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    await withdraw(parseFloat(amount));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Balances</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold mb-4">
            {loading ? 'Loading...' : `${formatNumber(balance, 2)} SOL`}
          </p>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Amount"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={handleDeposit}>Deposit</Button>
            <Button variant="secondary" onClick={handleWithdraw}>
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Balances;
