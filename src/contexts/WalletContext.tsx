import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  wallet: any;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  signTransaction: any;
  signAllTransactions: any;
  connection: Connection;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Get RPC endpoint from environment or use default
const getRpcEndpoint = (): string => {
  const endpoint = process.env.REACT_APP_SOLANA_RPC_URL;
  if (endpoint) return endpoint;
  
  // Use mainnet by default
  return process.env.NODE_ENV === 'production' 
    ? 'https://api.mainnet-beta.solana.com'
    : clusterApiUrl('devnet');
};

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletContextProvider({ children }: WalletProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = process.env.REACT_APP_SOLANA_NETWORK || 'mainnet-beta';
  const endpoint = useMemo(() => getRpcEndpoint(), []);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
  );

  // Create connection
  const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

  const onError = (error: any) => {
    console.error('Wallet error:', error);
    toast.error(error.message || 'Wallet connection failed');
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>
          <WalletContextWrapper connection={connection}>
            {children}
          </WalletContextWrapper>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

interface WalletContextWrapperProps {
  children: ReactNode;
  connection: Connection;
}

function WalletContextWrapper({ children, connection }: WalletContextWrapperProps) {
  const {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnect: walletDisconnect,
    connect: walletConnect,
    signTransaction,
    signAllTransactions,
  } = useSolanaWallet();

  const connect = async () => {
    try {
      await walletConnect();
      if (publicKey) {
        toast.success(`Connected to ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`);
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const disconnect = async () => {
    try {
      await walletDisconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error(error.message || 'Failed to disconnect wallet');
    }
  };

  const value: WalletContextType = {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnect,
    connect,
    signTransaction,
    signAllTransactions,
    connection,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
}

// Export wallet components for use in UI
export { WalletMultiButton, WalletDisconnectButton };

// Helper hook for wallet operations
export function useWalletOperations() {
  const { publicKey, connected, signTransaction, signAllTransactions, connection } = useWallet();

  const sendTransaction = async (transaction: any) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      throw new Error(error.message || 'Transaction failed');
    }
  };

  const getBalance = async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  };

  return {
    publicKey,
    connected,
    sendTransaction,
    getBalance,
    signTransaction,
    signAllTransactions,
    connection,
  };
}