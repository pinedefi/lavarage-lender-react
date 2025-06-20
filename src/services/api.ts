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
  LiquidationSearchParams,
  LiquidationSearchResponse,
  LiquidationData,
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private apiKey: string;

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
      (config) => {
        // Add timestamp to prevent caching
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
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

  // Get current API configuration
  getConfig(): { baseURL: string; apiKey: string } {
    return {
      baseURL: this.api.defaults.baseURL || '',
      apiKey: this.apiKey,
    };
  }

  // Liquidation Management
  async searchLiquidations(params: LiquidationSearchParams): Promise<LiquidationData[]> {
    const requestBody = {
      method: "search",
      params: {
        gte: params.gte,
        lte: params.lte,
      }
    };

    try {
      // Use the same base URL as the main API, but with a different endpoint
      const response = await axios.post(
        `${this.api.defaults.baseURL}/api/sdk/v1.0/liquidations/search`,
        requestBody,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          timeout: 30000
        }
      );

      const data: LiquidationSearchResponse = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Parse the JSON strings in the result object
      const liquidations: LiquidationData[] = [];
      for (const [timestamp, jsonString] of Object.entries(data.result)) {
        try {
          const liquidationData: LiquidationData = JSON.parse(jsonString);
          liquidations.push(liquidationData);
        } catch (parseError) {
          console.error('Failed to parse liquidation data:', parseError);
        }
      }

      return liquidations;
    } catch (error) {
      console.error('Search liquidations error:', error);
      throw new Error('Failed to fetch liquidation data');
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export class for testing or multiple instances
export default ApiService;
