import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import { GradientText, LavarageLogo } from '@/components/brand';

const NotFound: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
      <div className="card-lavarage w-full max-w-lg text-center p-8">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <LavarageLogo variant="mark" size="xl" className="opacity-80" />
          </div>
          
          <GradientText 
            variant="primary" 
            size="3xl" 
            weight="bold"
            as="h1"
            className="mb-4"
          >
            404
          </GradientText>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          
          <p className="text-gray-500 text-sm">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button variant="lavarage" className="w-full" asChild>
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Dashboard
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-lavarage-orange/20">
          <p className="text-xs text-gray-500">
            Need help? Contact{' '}
            <span className="text-lavarage-coral font-medium">LAVARAGE</span> support
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
