import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users } from 'lucide-react';

const Positions: React.FC = () => {
  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Positions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Active Positions</h3>
            <p className="mt-2 text-center text-gray-600">
              You don't have any active lending positions at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Positions;
