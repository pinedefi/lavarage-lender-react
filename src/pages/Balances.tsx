import React, { useState } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { WalletMultiButton } from "@/contexts/WalletContext";
import { useWallet } from "@/contexts/WalletContext";
import { usePool } from "@/hooks/usePool";
import { GradientText } from "@/components/brand";
import { formatNumber } from "@/utils";
import { DollarSign, AlertCircle } from "lucide-react";
import { QUOTE_TOKENS } from "@/utils/tokens";

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
}) => {
  const isAmountValid = amount && parseFloat(amount) > 0;
  const isAmountExceedsBalance = amount && parseFloat(amount) > balance;

  return (
    <div className={`card-lavarage h-full hover:shadow-2xl transition-all duration-300 ${isSelected ? "ring-2 ring-lavarage-coral" : ""}`}>
      <div className="p-6 border-b border-lavarage-orange/20">
        <GradientText variant="primary" size="lg" weight="bold">
          {token} Balance
        </GradientText>
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
          <GradientText variant="primary" size="2xl" weight="bold">
            {loading ? "Loading..." : `${formatNumber(balance, 3)} ${token}`}
          </GradientText>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Input
              type="number"
              placeholder="Enter amount"
              min="0"
              step="0.1"
              value={isSelected ? amount : ""}
              onChange={(e) => {
                if (isSelected) {
                  onAmountChange(e.target.value);
                }
              }}
              disabled={!isSelected || isProcessing}
              className={`w-full transition-all duration-300 ${
                isAmountExceedsBalance 
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                  : "focus:border-lavarage-coral focus:ring-lavarage-coral/20"
              }`}
            />
            {isAmountExceedsBalance && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          
          {isAmountExceedsBalance && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-2" />
                Amount exceeds available balance
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onDeposit}
              disabled={!isSelected || !isAmountValid || isProcessing}
              variant="lavarage"
              className="flex-1 font-semibold text-white shadow-lg hover:shadow-xl"
            >
              {isProcessing ? "Processing..." : "Deposit"}
            </Button>
            <Button 
              onClick={onWithdraw}
              disabled={!isSelected || !isAmountValid || isAmountExceedsBalance || isProcessing}
              className="flex-1 font-semibold bg-white border-2 border-lavarage-coral text-lavarage-coral hover:bg-lavarage-coral hover:text-white hover:border-lavarage-coral transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isProcessing ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Balances: React.FC = () => {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const { balance: solBalance, loading: solLoading, deposit: depositSol, withdraw: withdrawSol } = usePool({ quoteToken: "So11111111111111111111111111111111111111112" });
  const { balance: usdcBalance, loading: usdcLoading, deposit: depositUsdc, withdraw: withdrawUsdc } = usePool({ quoteToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" });
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

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

      {/* Token Selection - Mobile First */}
      <div className="flex justify-center space-x-2 sm:space-x-4">
        <Button
          variant={selectedToken === "SOL" ? "lavarage" : "outline"}
          onClick={() => handleTokenSelect("SOL")}
          disabled={isProcessing}
          className={`flex-1 sm:flex-none min-w-[80px] font-semibold transition-all duration-300 ${
            selectedToken !== "SOL" 
              ? "bg-white border-2 border-lavarage-coral text-lavarage-coral hover:bg-lavarage-coral hover:text-white shadow-md hover:shadow-lg" 
              : "text-white shadow-lg hover:shadow-xl"
          }`}
        >
          SOL
        </Button>
        <Button
          variant={selectedToken === "USDC" ? "lavarage" : "outline"}
          onClick={() => handleTokenSelect("USDC")}
          disabled={isProcessing}
          className={`flex-1 sm:flex-none min-w-[80px] font-semibold transition-all duration-300 ${
            selectedToken !== "USDC" 
              ? "bg-white border-2 border-lavarage-coral text-lavarage-coral hover:bg-lavarage-coral hover:text-white shadow-md hover:shadow-lg" 
              : "text-white shadow-lg hover:shadow-xl"
          }`}
        >
          USDC
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BalanceCard
          token="SOL"
          balance={solBalance}
          loading={solLoading}
          isSelected={selectedToken === "SOL"}
          amount={amount}
          onAmountChange={setAmount}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          isProcessing={isProcessing}
        />
        
        <BalanceCard
          token="USDC"
          balance={usdcBalance}
          loading={usdcLoading}
          isSelected={selectedToken === "USDC"}
          amount={amount}
          onAmountChange={setAmount}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default Balances;
