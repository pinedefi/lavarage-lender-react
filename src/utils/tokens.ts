export const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
export const USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Quote token configuration for offers
export const QUOTE_TOKENS = {
  SOL: {
    address: SOL_ADDRESS,
    symbol: "SOL",
    name: "Wrapped SOL",
    decimals: 9,
  },
  USDC: {
    address: USDC_ADDRESS,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
} as const;

// Helper to get quote token address by symbol
export const getQuoteTokenAddress = (
  symbol: keyof typeof QUOTE_TOKENS
): string => {
  return QUOTE_TOKENS[symbol].address;
};

// Export available quote token symbols
export const QUOTE_TOKEN_SYMBOLS = Object.keys(QUOTE_TOKENS) as Array<
  keyof typeof QUOTE_TOKENS
>;
