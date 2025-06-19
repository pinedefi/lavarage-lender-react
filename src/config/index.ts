// Collection key for Lavarock NFT validation
export const COLLECTION_KEY = '3HeEvzCyUK3M7Q2xkvMeZojAnVYmn3yHGHHJHmRktUVw';

// Solana RPC endpoint
export const SOLANA_RPC_URL =
  process.env.REACT_APP_SOLANA_RPC_URL ||
  'https://mainnet.helius-rpc.com/?api-key=' + (process.env.REACT_APP_HELIUS_API_KEY || '');
