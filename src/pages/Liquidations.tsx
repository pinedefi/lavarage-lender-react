import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';

const Liquidations: React.FC = () => {
  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Liquidations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At Risk Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Positions at Risk</h3>
            <p className="mt-2 text-center text-gray-600">
              There are currently no positions at risk of liquidation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Liquidations;