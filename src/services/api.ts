import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  OfferV2Model,
  PositionV3Model,
  CreateOfferFormData,
  UpdateOfferFormData,
  ApiResponse,
  TransactionModel,
  TokenModel,
  HeliusTokenModel,
} from '@/types';
import { nftValidationService } from './nftValidation';

class ApiService {
  private api: AxiosInstance;
  private apiKey: string;
  private walletAddress: string | null = null;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'https://api.lavarage.com') {
    this.apiKey = process.env.REACT_APP_API_KEY || '';

    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add timestamp to prevent caching
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        } else {
          // For non-GET requests, validate NFT ownership
          await this.validateNFTForLenderEndpoints(config);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
      }
    );
  }

  private async validateNFTForLenderEndpoints(config: any): Promise<void> {
    // Check if this is a lender endpoint that requires NFT validation
    const lenderEndpoints = [
      '/api/sdk/v1.0/lender/offers/create',
      '/api/sdk/v1.0/lender/offers/update',
      '/api/sdk/v1.0/lender/offers/changeLTV',
      '/api/sdk/v1.0/lender/pools/deposit',
      '/api/sdk/v1.0/lender/pools/withdraw',
    ];

    const isLenderEndpoint = lenderEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isLenderEndpoint) {
      return;
    }

    // Skip validation in development/staging environments
    if (process.env.NODE_ENV !== 'production') {
      console.log('Skipping NFT validation in development environment');
      return;
    }

    // Extract wallet address from request data
    const walletAddress = this.extractWalletAddress(config);
    if (!walletAddress) {
      throw new Error('Wallet address is required for lender operations');
    }

    // Validate NFT ownership
    try {
      const hasNFT = await nftValidationService.hasLavaRockNFT(walletAddress);
      if (!hasNFT) {
        throw new Error('Access denied: Lavarock NFT required for lender operations');
      }
    } catch (error) {
      console.error('NFT validation failed:', error);
      throw new Error('Unable to verify NFT ownership. Please ensure you own a Lavarock NFT.');
    }
  }

  private extractWalletAddress(config: any): string | null {
    // Try to extract wallet address from various sources
    if (config.data?.userWallet) {
      return config.data.userWallet;
    }

    if (config.params?.userWallet) {
      return config.params.userWallet;
    }

    // For changeLTV endpoint, we'll need to handle this differently
    // as it requires looking up the offer owner
    if (config.url?.includes('/changeLTV') && config.data?.offerAddress) {
      // Return a placeholder - the backend will handle the validation
      // since we can't easily look up offer ownership from the frontend
      return this.walletAddress;
    }

    return this.walletAddress;
  }

  // Offer Management
  async getOffers(
    params: {
      includeTokens?: boolean;
      inactiveOffers?: boolean;
      includeRawData?: boolean;
      chain?: 'solana' | 'bsc';
      tags?: string[];
    } = {}
  ): Promise<OfferV2Model[]> {
    const response = await this.api.get('/api/sdk/v1.0/offers/v2', { params });
    return response.data;
  }

  async getLenderOffers(params: {
    lenderWallet: string;
    inactiveOffers?: boolean;
    includeRawData?: boolean;
    chain?: 'solana' | 'bsc';
    tags?: string[];
  }): Promise<OfferV2Model[]> {
    const response = await this.api.get('/api/sdk/v1.0/lender/offers', {
      params,
    });
    return response.data;
  }

  async createOffer(data: CreateOfferFormData): Promise<TransactionModel> {
    const response = await this.api.post('/api/sdk/v1.0/lender/offers/create', data);
    return response.data;
  }

  async updateOffer(data: UpdateOfferFormData): Promise<TransactionModel> {
    const response = await this.api.put('/api/sdk/v1.0/lender/offers/update', data);
    return response.data;
  }

  async changeLTV(data: {
    offerAddress: string;
    signature: string;
    newLTV: number;
  }): Promise<void> {
    const response = await this.api.put('/api/sdk/v1.0/lender/offers/changeLTV', data);
    return response.data;
  }

  // Position Management
  async getLenderPositions(params: {
    lenderWallet: string;
    status?: 'open' | 'closed' | 'liquidated' | 'all';
    includeInactionable?: boolean;
  }): Promise<PositionV3Model[]> {
    const response = await this.api.get('/api/sdk/v1.0/lender/positions', {
      params,
    });
    return response.data;
  }

  async getPositions(
    params: {
      userPubKey?: string;
      status?: 'open' | 'closed' | 'liquidated' | 'all';
      includeInactionable?: boolean;
    } = {}
  ): Promise<PositionV3Model[]> {
    const response = await this.api.get('/api/sdk/v1.0/positions/v3', {
      params,
      headers: { 'x-api-key': this.apiKey },
    });
    return response.data;
  }

  // Pool Management
  async getPoolBalance(params: { userWallet: string; quoteToken: string }): Promise<any> {
    const response = await this.api.get('/api/sdk/v1.0/lender/pools/balance', {
      params,
    });
    return response.data;
  }

  async depositFunds(data: {
    amount: number;
    quoteToken: string;
    userWallet: string;
  }): Promise<TransactionModel> {
    const response = await this.api.post('/api/sdk/v1.0/lender/pools/deposit', data);
    return response.data;
  }

  async withdrawFunds(data: {
    amount: number;
    quoteToken: string;
    userWallet: string;
  }): Promise<TransactionModel> {
    const response = await this.api.post('/api/sdk/v1.0/lender/pools/withdraw', data);
    return response.data;
  }

  async getTokenMetadata(tokenAddress: string): Promise<TokenModel> {
    const apiKey = process.env.REACT_APP_HELIUS_API_KEY || '';

    const requestBody = {
      jsonrpc: '2.0',
      id: '1',
      method: 'getAsset',
      params: {
        id: tokenAddress,
      },
    };

    let heliusData: HeliusTokenModel;
    try {
      const { data } = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
        requestBody,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!data.result) {
        throw new Error('Helius RPC returned no result');
      }
      heliusData = data.result;
    } catch (e) {
      console.error('getTokenMetadata error:', e);
      throw new Error('Failed to fetch token metadata');
    }

    // Convert Helius response to our TokenModel format
    return {
      address: heliusData.id,
      name: heliusData.content.metadata.name,
      symbol: heliusData.content.metadata.symbol,
      logoURI: heliusData.content.links?.image,
      decimals: heliusData.token_info?.decimals ?? 9,
    };
  }

  // Utility Methods
  async getJupiterPrice(params: { baseCurrencies: string; vsToken: string }): Promise<any> {
    const response = await this.api.get('/api/sdk/v1.0/jupiter/price', {
      params,
      headers: {
        'x-api-key': this.apiKey,
        referer: window.location.origin,
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Set API key dynamically
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.api.defaults.headers['x-api-key'] = apiKey;
  }

  // Set wallet address for NFT validation
  setWalletAddress(walletAddress: string | null): void {
    this.walletAddress = walletAddress;
  }

  // Get current API configuration
  getConfig(): { baseURL: string; apiKey: string } {
    return {
      baseURL: this.api.defaults.baseURL || '',
      apiKey: this.apiKey,
    };
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export class for testing or multiple instances
export default ApiService;
