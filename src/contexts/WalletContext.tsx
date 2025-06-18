import React, { createContext, useContext, useMemo, useCallback } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet as useSolanaWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CloverWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Connection, clusterApiUrl, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  select: (walletName: string) => void;
  wallet: any;
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>;
  sendTransaction: (transaction: VersionedTransaction) => Promise<string>;
  connection: Connection;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const network =
    (process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    return process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(network);
  }, [network]);

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
  const { connection } = useConnection();
  const {
    connected,
    publicKey,
    select,
    connect,
    disconnect,
    wallet,
    signTransaction: walletSignTransaction,
    sendTransaction: walletSendTransaction,
  } = useSolanaWallet();

  const signTransaction = useCallback(async (transaction: VersionedTransaction): Promise<VersionedTransaction> => {
    if (!walletSignTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }
    return await walletSignTransaction(transaction);
  }, [walletSignTransaction]);

  const sendTransaction = useCallback(async (transaction: VersionedTransaction): Promise<string> => {
    if (!walletSendTransaction) {
      throw new Error("Wallet does not support transaction sending");
    }
    return await walletSendTransaction(transaction, connection);
  }, [walletSendTransaction, connection]);

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
      signTransaction,
      sendTransaction,
      connection,
    }),
    [connected, publicKey, connect, disconnect, select, wallet, signTransaction, sendTransaction, connection]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export { WalletMultiButton };
export default WalletContextProvider;
