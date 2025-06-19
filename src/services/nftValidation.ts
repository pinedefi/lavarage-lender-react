import {
  fetchAllDigitalAssetByOwner,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { Connection, PublicKey } from '@solana/web3.js';
import { COLLECTION_KEY, SOLANA_RPC_URL } from '@/config';

interface Collection {
  value?: {
    key: string;
  };
}

export class NFTValidationService {
  private connection: Connection;

  constructor(connection?: Connection) {
    this.connection = connection || new Connection(SOLANA_RPC_URL);
  }

  /**
   * Check if a wallet address owns a Lavarock NFT
   * @param userAddress - The wallet address to check
   * @returns Promise<boolean> - True if the wallet owns a Lavarock NFT
   */
  async hasLavaRockNFT(userAddress: string): Promise<boolean> {
    if (!userAddress) {
      return false;
    }

    try {
      new PublicKey(userAddress);

      const umi = createUmi(this.connection).use(mplTokenMetadata());
      const userPublicKey = publicKey(userAddress);
      const assets = await fetchAllDigitalAssetByOwner(umi, userPublicKey);

      for (const asset of assets) {
        const currentCollection = asset.metadata.collection as Collection;
        if (currentCollection?.value?.key === COLLECTION_KEY) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for Lava Rock NFT:', error);
      return false;
    }
  }
}

// Create singleton instance
export const nftValidationService = new NFTValidationService();
