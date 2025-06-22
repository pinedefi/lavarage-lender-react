import { PublicKey } from '@solana/web3.js';
import { COLLECTION_KEY } from '@/config';

interface HeliusAsset {
  interface: string;
  id: string;
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
}

interface HeliusResponse {
  jsonrpc: string;
  result: {
    total: number;
    limit: number;
    page: number;
    items: HeliusAsset[];
  };
  id: string;
  error?: {
    code: number;
    message: string;
  };
}

export class NFTValidationService {
  private heliusRpcUrl: string;

  constructor() {
    const apiKey = process.env.REACT_APP_HELIUS_API_KEY;
    if (!apiKey) {
      throw new Error('REACT_APP_HELIUS_API_KEY is required for NFT validation');
    }
    this.heliusRpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  }

  /**
   * Check if a wallet address owns a Lavarock NFT using Helius DAS API
   * @param userAddress - The wallet address to check
   * @returns Promise<boolean> - True if the wallet owns a Lavarock NFT
   */
  async hasLavaRockNFT(userAddress: string): Promise<boolean> {
    if (!userAddress) {
      return false;
    }

    try {
      // Validate the address format
      new PublicKey(userAddress);

      // Use Helius DAS API to get assets by owner
      const response = await fetch(this.heliusRpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'lavarock-nft-check',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: userAddress,
            page: 1,
            limit: 1000, // Set high limit to check all assets
            options: {
              showUnverifiedCollections: true, // Include unverified collections
              showCollectionMetadata: false,
              showGrandTotal: false,
              showFungible: false,
              showNativeBalance: false,
              showInscription: false,
              showZeroBalance: false,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HeliusResponse = await response.json();

      // Check for API errors
      if (data.error) {
        throw new Error(`Helius API error: ${data.error.message} (Code: ${data.error.code})`);
      }

      // Check if any asset belongs to the Lavarock collection
      for (const asset of data.result.items) {
        if (asset.grouping) {
          for (const group of asset.grouping) {
            if (group.group_key === 'collection' && group.group_value === COLLECTION_KEY) {
              console.log(`Found Lavarock NFT: ${asset.id} in wallet ${userAddress}`);
              return true;
            }
          }
        }
      }

      console.log(
        `No Lavarock NFT found in wallet ${userAddress}. Checked ${data.result.items.length} assets.`
      );
      return false;
    } catch (error) {
      console.error('Error checking for Lava Rock NFT:', error);
      return false;
    }
  }
}

// Create singleton instance
export const nftValidationService = new NFTValidationService();
