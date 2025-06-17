import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h1 className="mb-2 text-4xl font-bold">404</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button variant="primary" className="w-full" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
