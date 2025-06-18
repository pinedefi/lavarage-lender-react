import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3, Clock } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="card-glass p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
            <p className="mt-2 text-center text-gray-600">
              Advanced analytics and performance metrics are being developed. Stay tuned for detailed insights into your lending portfolio.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 text-center">Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 text-center">Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 text-center">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
