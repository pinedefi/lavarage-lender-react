import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 500; // Approximate height of dropdown
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const timestampToDatetimeLocal = (timestamp: string): string => {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      if (isNaN(date.getTime())) return '';
      
      // Convert to local timezone for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const handleDateChange = useCallback((type: 'gte' | 'lte', value: string) => {
    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the validation to prevent excessive calls while typing
    debounceRef.current = setTimeout(() => {
      if (!value) return; // Handle empty input
      
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          setError('Invalid date format');
          return;
        }
        
        const timestamp = Math.floor(date.getTime() / 1000).toString();
        let newGte = type === 'gte' ? timestamp : gte;
        let newLte = type === 'lte' ? timestamp : lte;
        
        // Auto-adjust the other date if the range exceeds 7 days
        const gteDate = new Date(parseInt(newGte) * 1000);
        const lteDate = new Date(parseInt(newLte) * 1000);
        const diffInDays = (lteDate.getTime() - gteDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffInDays > 7) {
          if (type === 'gte') {
            // User changed start date, adjust end date to be 7 days later
            const adjustedEndDate = new Date(gteDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            newLte = Math.floor(adjustedEndDate.getTime() / 1000).toString();
          } else {
            // User changed end date, adjust start date to be 7 days earlier
            const adjustedStartDate = new Date(lteDate.getTime() - (7 * 24 * 60 * 60 * 1000));
            newGte = Math.floor(adjustedStartDate.getTime() / 1000).toString();
          }
        } else if (diffInDays < 0) {
          setError('End date must be after start date');
          return;
        }
        
        setError(null);
        onDateRangeChange({
          gte: newGte,
          lte: newLte,
        });
      } catch (error) {
        setError('Invalid date format');
      }
    }, 300); // 300ms debounce
  }, [gte, lte, onDateRangeChange]);

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
    <div ref={containerRef} className={`relative ${className}`}>
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
        <div className={`absolute left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[300px] max-h-[500px] overflow-y-auto ${
          dropdownPosition === 'bottom' 
            ? 'top-full mt-2' 
            : 'bottom-full mb-2'
        }`}>
          <div className="p-3">
            {error && (
              <div className="mb-3 p-2 bg-lavarage-red/5 border border-lavarage-red/20 rounded-md">
                <div className="flex items-center space-x-2 text-lavarage-red">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(1)}
                  className="text-xs flex-1 min-w-0"
                >
                  Last 24h
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(3)}
                  className="text-xs flex-1 min-w-0"
                >
                  Last 3 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresetRange(7)}
                  className="text-xs flex-1 min-w-0"
                >
                  Last 7 days
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
                  value={timestampToDatetimeLocal(gte)}
                  onChange={(e) => {
                    setError(null); // Clear error when user starts typing
                    handleDateChange('gte', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lavarage-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDatetimeLocal(lte)}
                  onChange={(e) => {
                    setError(null); // Clear error when user starts typing
                    handleDateChange('lte', e.target.value);
                  }}
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