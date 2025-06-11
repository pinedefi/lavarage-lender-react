import { PublicKey } from "@solana/web3.js";

// Solana Types
export interface SolanaPublicKey {
  toBase58(): string;
  toString(): string;
}

// Token Types
export interface TokenModel {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
}

// Offer Types
export interface OfferAccount {
  interestRate: number;
  collateralType: SolanaPublicKey;
  maxBorrow: string;
  nodeWallet: SolanaPublicKey;
  maxExposure: string;
  currentExposure: string;
}

export interface OfferModel {
  publicKey: SolanaPublicKey;
  account: OfferAccount;
  collateralToken?: TokenModel;
  quoteToken: TokenModel | string;
  maxLeverage: number;
  maxOpenPerTrade: number;
  availableForOpen: number;
  tags?: string[];
}

export interface OfferV2Model {
  publicKey: SolanaPublicKey;
  apr: number;
  maxBorrow: string;
  nodeWallet: SolanaPublicKey;
  maxExposure: string;
  currentExposure: string;
  collateralToken?: TokenModel;
  quoteToken: TokenModel | string;
  maxLeverage: number;
  maxOpenPerTrade: string;
  availableForOpen: string;
  tags?: string[];
  active: boolean;
  account: OfferAccount;
  createdAt: string;
}

// Position Types
export interface PositionAccount {
  pool: SolanaPublicKey;
  closeStatusRecallTimestamp: string;
  amount: string;
  userPaid: string;
  collateralAmount: string;
  timestamp: string;
  trader: SolanaPublicKey;
  seed: SolanaPublicKey;
  closeTimestamp: string;
  closingPositionSize: string;
  interestRate: number;
  lastInterestCollect: string;
}

export interface PositionModel {
  publicKey: SolanaPublicKey;
  account: PositionAccount;
  takeProfitPrice?: string;
  onChainStatus?: any;
}

export interface FullDetailsUI {
  entryPrice: number;
  interestAccrued: number;
  liquidationPrice: number;
}

export interface OpenPositionModel extends PositionModel {
  offer: OfferModel;
  fullDetailsUI: FullDetailsUI;
}

export interface PositionV3Model {
  status: "active" | "sold by take profit" | "repaid" | "sold" | "liquidated";
  openTimestamp: string;
  closeTimestamp: string;
  quoteToken: TokenModel;
  collateralToken: TokenModel;
  initialBorrowQuote: string;
  initialMarginQuote: string;
  apr: number;
  lastInterestCollectTimestamp: string;
  initialPositionBase: string;
  closePositionQuote?: string;
  currentPrice: number;
  currentPositionBase: string;
  currentLtv: string;
  entryPrice: number;
  interestAccrued: number;
  liquidationPrice: number;
  positionAddress: SolanaPublicKey;
  offerAddress: SolanaPublicKey;
  traderAddress: SolanaPublicKey;
  offerCreatedAt: string;
  updatedAt: string;
  takeProfitPrice?: string;
  onChainStatus?: any;
  isActionable: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalLiquidityDeployed: number;
  activeOffersCount: number;
  portfolioUtilization: number;
  totalInterestEarned: number;
  activePositionsCount: number;
  averageAPR: number;
}

// Liquidation Types
export interface LiquidationEvent {
  id: string;
  positionId: string;
  collateralAmount: string;
  liquidationPrice: number;
  saleProceeds: number;
  pnl: number;
  status: "cooldown" | "processing" | "deposited";
  timestamp: string;
  cooldownEndsAt?: string;
}

// Form Types
export interface CreateOfferFormData {
  collateralToken: string;
  maxExposure: number;
  interestRate: number;
  quoteToken: string;
  tokenData?: TokenModel;
}

export interface UpdateOfferFormData {
  nodeWallet: string;
  collateralToken: string;
  quoteToken: string;
  maxExposure: number;
  interestRate: number;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface TransactionModel {
  transaction: string;
  quoteResponse?: any;
}

// Wallet Types
export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  wallet: any;
}
