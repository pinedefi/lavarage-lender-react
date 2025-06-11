import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus } from 'lucide-react';

const CreateOffer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Offer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Lending Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (SOL)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount to lend"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (APR %)
                </label>
                <Input
                  type="number"
                  placeholder="Enter annual interest rate"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Days)
                </label>
                <Input
                  type="number"
                  placeholder="Enter loan duration in days"
                  min="1"
                  step="1"
                />
              </div>
            </div>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;