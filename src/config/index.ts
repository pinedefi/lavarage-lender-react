// Collection key for Lavarock NFT validation
export const COLLECTION_KEY = '3HeEvzCyUK3M7Q2xkvMeZojAnVYmn3yHGHHJHmRktUVw';

// Solana RPC endpoint
export const SOLANA_RPC_URL =
  process.env.REACT_APP_SOLANA_RPC_URL ||
  (process.env.REACT_APP_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`
    : 'https://api.mainnet-beta.solana.com'); // Fallback to public RPC

// Lender endpoints that require NFT validation
export const LENDER_ENDPOINTS_REQUIRING_NFT = [
  '/api/sdk/v1.0/lender/offers/create',
  '/api/sdk/v1.0/lender/offers/update',
  '/api/sdk/v1.0/lender/offers/changeLTV',
  '/api/sdk/v1.0/lender/pools/deposit',
  '/api/sdk/v1.0/lender/pools/withdraw',
] as const;
