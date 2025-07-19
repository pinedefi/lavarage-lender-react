import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { WalletMultiButton } from "@/contexts/WalletContext";
import { useWallet } from "@/contexts/WalletContext";
import { usePool } from "@/hooks/usePool";
import { useOffers } from "@/hooks/useOffers";
import { GradientText } from "@/components/brand";
import { formatNumberFloor } from "@/utils";
import { SOL_ADDRESS, USDC_ADDRESS } from "@/utils/tokens";
import { DollarSign, AlertCircle, Plus, Info } from "lucide-react";

interface BalanceCardProps {
  token: "SOL" | "USDC";
  balance: number;
  loading: boolean;
  isSelected: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  isProcessing: boolean;
  onSelect: () => void;
  hasOffersForToken: boolean;
  withdrawPressed: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  token,
  balance,
  loading,
  isSelected,
  amount,
  onAmountChange,
  onDeposit,
  onWithdraw,
  isProcessing,
  onSelect,
  hasOffersForToken,
  withdrawPressed,
}) => {
  const isAmountValid = amount && parseFloat(amount) > 0;
  const isAmountExceedsBalance = isSelected && amount && parseFloat(amount) > balance;
  
  // Only show "exceeds balance" error for withdrawals and only after withdraw was pressed
  const shouldShowExceedsBalanceError = withdrawPressed && isAmountExceedsBalance;

  return (
    <div 
      className={`card-lavarage h-full hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        isSelected ? "ring-2 ring-lavarage-coral" : "hover:ring-2 hover:ring-lavarage-coral/50"
      }`}
      onClick={onSelect}
    >
      <div className="p-6 border-b border-lavarage-orange/20">
        <GradientText variant="primary" size="lg" weight="bold">
          {token} Balance
        </GradientText>
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
          <GradientText variant="primary" size="2xl" weight="bold">
            {loading ? "Loading..." : `${formatNumberFloor(balance, 3)} ${token}`}
          </GradientText>
        </div>
        
        {isSelected && (
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount"
                min="0"
                step="0.1"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                disabled={isProcessing}
                className={`w-full transition-all duration-300 ${
                  shouldShowExceedsBalanceError 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                    : "focus:border-lavarage-coral focus:ring-lavarage-coral/20"
                }`}
              />
            </div>
            
            {shouldShowExceedsBalanceError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                  Amount exceeds available pool balance
                </p>
              </div>
            )}

            {/* Show message when user doesn't have offers for this specific token */}
            {!hasOffersForToken && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-600 flex items-center">
                  <Info className="h-3 w-3 mr-2 flex-shrink-0" />
                  You need to create a {token} loan offer before managing {token} pool funds.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3" onClick={(e) => e.stopPropagation()}>
              <Button 
                onClick={onDeposit}
                disabled={!isAmountValid || isProcessing || !hasOffersForToken}
                variant="lavarage"
                className="flex-1 font-semibold text-white shadow-lg hover:shadow-xl"
              >
                {isProcessing ? "Processing..." : "Deposit"}
              </Button>
              <Button 
                onClick={onWithdraw}
                disabled={!isAmountValid || isAmountExceedsBalance || isProcessing || !hasOffersForToken}
                className="flex-1 font-semibold bg-white border-2 border-lavarage-coral text-lavarage-coral hover:bg-lavarage-coral hover:text-white hover:border-lavarage-coral transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isProcessing ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        )}
        
        {!isSelected && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Click to select and manage funds</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Balances: React.FC = () => {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const { offers } = useOffers({ autoRefresh: true });
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawPressed, setWithdrawPressed] = useState(false);

  // Helper function to check if user has offers for specific token
  const hasOffersForToken = (tokenType: "SOL" | "USDC"): boolean => {
    const targetAddress = tokenType === "SOL" 
      ? SOL_ADDRESS 
      : USDC_ADDRESS;
    
    return offers.some(offer => {
      if (typeof offer.quoteToken === 'string') {
        return offer.quoteToken === targetAddress;
      } else if (offer.quoteToken && typeof offer.quoteToken === 'object') {
        return offer.quoteToken.address === targetAddress;
      }
      return false;
    });
  };

  const hasSOLOffers = hasOffersForToken("SOL");
  const hasUSDCOffers = hasOffersForToken("USDC");
  const hasAnyOffers = offers.length > 0;

  const { balance: solBalance, loading: solLoading, deposit: depositSol, withdraw: withdrawSol } = usePool({ 
    quoteToken: SOL_ADDRESS, 
    hasOffers: hasSOLOffers 
  });
  const { balance: usdcBalance, loading: usdcLoading, deposit: depositUsdc, withdraw: withdrawUsdc } = usePool({ 
    quoteToken: USDC_ADDRESS, 
    hasOffers: hasUSDCOffers 
  });

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    // Reset withdraw pressed state
    setWithdrawPressed(false);

    setIsProcessing(true);
    
    try {
      if (selectedToken === "SOL") {
        await depositSol(parseFloat(amount));
      } else {
        await depositUsdc(parseFloat(amount));
      }
      setAmount("");
    } catch (error: any) {
      // Error handling is done in the usePool hook
      console.error('Deposit error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const currentBalance = selectedToken === "SOL" ? solBalance : usdcBalance;
    
    // Set withdraw pressed to show validation errors
    setWithdrawPressed(true);
    
    if (parseFloat(amount) > currentBalance) {
      return;
    }

    setIsProcessing(true);
    
    try {
      if (selectedToken === "SOL") {
        await withdrawSol(parseFloat(amount));
      } else {
        await withdrawUsdc(parseFloat(amount));
      }
      setAmount("");
      setWithdrawPressed(false);
    } catch (error: any) {
      // Error handling is done in the usePool hook
      console.error('Withdraw error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTokenSelect = (token: "SOL" | "USDC") => {
    if (isProcessing) return; // Prevent token switching during processing
    setSelectedToken(token);
    setAmount("");
    setWithdrawPressed(false); // Reset withdraw pressed state when switching tokens
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    // Reset withdraw pressed state when amount changes
    if (withdrawPressed) {
      setWithdrawPressed(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="card-lavarage w-full max-w-md text-center">
          <div className="p-6 sm:p-8">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-lavarage-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-lavarage-coral" />
            </div>
            <GradientText variant="primary" size="xl" weight="bold" className="mb-2">
              Connect Your Wallet
            </GradientText>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Connect your wallet to manage <span className="font-semibold text-lavarage-coral">LAVARAGE</span> pool funds.
            </p>
            <WalletMultiButton className="w-full !bg-lavarage-primary !rounded-md hover:!bg-lavarage-coral transition-all duration-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GradientText variant="primary" size="3xl" weight="bold" as="h1">
            Balances
          </GradientText>
          <p className="text-gray-600 mt-2">
            Manage your <span className="font-semibold text-lavarage-coral">LAVARAGE</span> pool deposits
          </p>
        </div>
      </div>

      {/* Create Offers Notice - Only show if user has no offers at all */}
      {connected && !hasAnyOffers && (
        <div className="card-lavarage p-6 mb-6 border border-lavarage-orange/20">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-lavarage-primary flex items-center justify-center mr-4 flex-shrink-0">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <GradientText variant="primary" size="lg" weight="bold" className="mb-2">
                Getting Started
              </GradientText>
              <p className="text-gray-700 mb-4 leading-relaxed">
                To start managing pool funds, you need to create a <span className="font-semibold text-lavarage-coral">loan offer</span> first.
              </p>
              <Link to="/create-offer">
                <Button variant="lavarage" size="sm" className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BalanceCard
          token="SOL"
          balance={solBalance}
          loading={solLoading}
          isSelected={selectedToken === "SOL"}
          amount={amount}
          onAmountChange={handleAmountChange}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          isProcessing={isProcessing}
          onSelect={() => handleTokenSelect("SOL")}
          hasOffersForToken={hasSOLOffers}
          withdrawPressed={withdrawPressed}
        />
        
        <BalanceCard
          token="USDC"
          balance={usdcBalance}
          loading={usdcLoading}
          isSelected={selectedToken === "USDC"}
          amount={amount}
          onAmountChange={handleAmountChange}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          isProcessing={isProcessing}
          onSelect={() => handleTokenSelect("USDC")}
          hasOffersForToken={hasUSDCOffers}
          withdrawPressed={withdrawPressed}
        />
      </div>
    </div>
  );
};

export default Balances;
