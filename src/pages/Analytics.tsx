import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Data Available</h3>
            <p className="mt-2 text-center text-gray-600">
              Start lending to view your portfolio analytics and performance metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;