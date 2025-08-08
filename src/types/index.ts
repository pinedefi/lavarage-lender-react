import { PublicKey } from '@solana/web3.js';

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

// Helius API Response Type
export interface HeliusTokenModel {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: Array<{
      uri: string;
      cdn_uri: string;
      mime: string;
    }>;
    metadata: {
      description: string;
      name: string;
      symbol: string;
      token_standard: string;
    };
    links: {
      image: string;
    };
  };
  authorities: Array<{
    address: string;
    scopes: string[];
  }>;
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: any[];
  royalty: {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  supply: number | null;
  mutable: boolean;
  burnt: boolean;
  token_info?: {
    symbol: string;
    supply: number;
    decimals: number;
    token_program: string;
    price_info?: {
      price_per_token: number;
      currency: string;
    };
  };
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
  targetLtv?: number;
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
  status: 'active' | 'sold by take profit' | 'repaid' | 'sold' | 'liquidated';
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
  positionLtv: number;
  positionValue: {
    valueInQuoteToken: number;
    pnlInQuoteToken: number;
  };
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
export interface LiquidationData {
  offer: string,
  position: string,
  amount: number,
  soldFor: number,
  toSellToken: string,
  toSellAmount: number,
  toReceiveToken: string,
  liquidatedAt: string,
  soldAt: string,
  liquidationTxid: string,
  sellTxid: string,
  sendTx?: string,
  sendAt?: string
}

export interface LiquidationSearchParams {
  gte?: string;
  lte?: string;
}

export interface LiquidationSearchResponse {
  result: Record<string, string>;
  error: string | null;
}

export interface LiquidationEvent {
  id: string;
  positionId: string;
  collateralAmount: string;
  liquidationPrice: number;
  saleProceeds: number;
  pnl: number;
  status: 'cooldown' | 'processing' | 'deposited';
  timestamp: string;
  cooldownEndsAt?: string;
}

// Form Types
export interface CreateOfferFormData {
  collateralToken: string;
  maxExposure: number;
  maxBorrow?: number;
  interestRate: number;
  quoteToken: string;
  userWallet: string;
}

export interface UpdateOfferFormData {
  nodeWallet: string;
  userWallet: string;
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
