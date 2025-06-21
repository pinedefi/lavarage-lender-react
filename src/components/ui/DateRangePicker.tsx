import React, { useState } from 'react';
import { Calendar, ChevronDown, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface DateRangePickerProps {
  gte: string;
  lte: string;
  onDateRangeChange: (range: { gte: string; lte: string }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  gte,
  lte,
  onDateRangeChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateDateRange = (gteTimestamp: string, lteTimestamp: string): boolean => {
    const gteDate = new Date(parseInt(gteTimestamp) * 1000);
    const lteDate = new Date(parseInt(lteTimestamp) * 1000);
    const diffInDays = (lteDate.getTime() - gteDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 7) {
      setError('Date range cannot exceed 7 days');
      return false;
    }
    
    if (diffInDays < 0) {
      setError('End date must be after start date');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDateChange = (type: 'gte' | 'lte', value: string) => {
    const timestamp = Math.floor(new Date(value).getTime() / 1000).toString();
    const newGte = type === 'gte' ? timestamp : gte;
    const newLte = type === 'lte' ? timestamp : lte;
    
    if (validateDateRange(newGte, newLte)) {
      onDateRangeChange({
        gte: newGte,
        lte: newLte,
      });
    }
  };

  const setPresetRange = (days: number) => {
    if (days > 7) {
      setError('Date range cannot exceed 7 days');
      return;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const past = now - (days * 24 * 60 * 60);
    onDateRangeChange({
      gte: past.toString(),
      lte: now.toString(),
    });
    setError(null);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 ${error ? 'border-lavarage-red' : ''}`}
      >
        <Calendar className="h-4 w-4" />
        <span>
          {formatTimestamp(gte)} - {formatTimestamp(lte)}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[300px]">
          <div className="p-4">
            {error && (
              <div className="mb-4 p-3 bg-lavarage-red/5 border border-lavarage-red/20 rounded-md">
                <div className="flex items-center space-x-2 text-lavarage-red">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(1)}
                  className="text-xs"
                >
                  Last 24h
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(3)}
                  className="text-xs"
                >
                  Last 3 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(7)}
                  className="text-xs"
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(7)}
                  className="text-xs opacity-50 cursor-not-allowed"
                  disabled
                >
                  Last 30 days
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="datetime-local"
                  value={new Date(parseInt(gte) * 1000).toISOString().slice(0, 16)}
                  onChange={(e) => handleDateChange('gte', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lavarage-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="datetime-local"
                  value={new Date(parseInt(lte) * 1000).toISOString().slice(0, 16)}
                  onChange={(e) => handleDateChange('lte', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lavarage-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!error) {
                    setIsOpen(false);
                  }
                }}
                disabled={!!error}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 