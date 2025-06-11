import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;