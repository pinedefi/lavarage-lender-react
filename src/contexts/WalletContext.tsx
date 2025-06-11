import React, { createContext, useContext, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CloverWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  select: (walletName: string) => void;
  wallet: any;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Devnet), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CloverWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextContent>{children}</WalletContextContent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletContextContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    connected,
    publicKey,
    select,
    connect,
    disconnect,
    wallet,
  } = useSolanaWallet();

  const value = useMemo(
    () => ({
      connected,
      publicKey,
      connect,
      disconnect,
      select: (walletName: string) => {
        // Convert string to WalletName type
        select(walletName as any);
      },
      wallet,
    }),
    [connected, publicKey, connect, disconnect, select, wallet]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export { WalletMultiButton };
export default WalletContextProvider;