import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { GradientText } from '@/components/brand';
import Button from '@/components/ui/Button';
import { ExternalLink, Gem } from 'lucide-react';

interface ErrorContextType {
  handleError: (error: string | Error) => void;
  showLavaRockModal: boolean;
  setShowLavaRockModal: (show: boolean) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [showLavaRockModal, setShowLavaRockModal] = useState(false);

  const handleError = useCallback((error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check if the error message contains "LavaRock NFT" (case insensitive)
    if (errorMessage.toLowerCase().includes('lavarock nft')) {
      console.log('LavaRock NFT error detected, showing modal');
      setShowLavaRockModal(true);
    } else {
      // For all other errors, show them via toast
      toast.error(errorMessage);
    }
  }, []);

  const openTensorTrade = () => {
    window.open('https://www.tensor.trade/trade/lava_rock_alpha_series', '_blank');
  };

  return (
    <ErrorContext.Provider value={{ handleError, showLavaRockModal, setShowLavaRockModal }}>
      {children}
      
      <Modal open={showLavaRockModal} onClose={() => setShowLavaRockModal(false)}>
        <div className="p-6 text-center bg-white rounded-lg">
          {/* LavaRock Collection Image */}
          <div className="mb-6">
            <img 
              src="https://lavarage-nft.vercel.app/collection.png" 
              alt="LavaRock NFT Collection" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
          
          <div className="h-16 w-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gem className="h-8 w-8 text-white" />
          </div>
          
          <GradientText variant="primary" size="xl" weight="bold" as="h2" className="mb-3">
            LavaRock NFT Required
          </GradientText>
          
          <p className="text-gray-600 mb-6">
            This feature requires a LavaRock NFT to access. Purchase your LavaRock NFT to unlock premium features and exclusive benefits.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={openTensorTrade}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buy LavaRock NFT on Tensor
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowLavaRockModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </ErrorContext.Provider>
  );
}; 