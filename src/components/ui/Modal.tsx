import * as React from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="flex min-h-full items-end justify-center px-4 pt-16 pb-4 text-center sm:items-center sm:p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={ref}
            className={cn(
              'card-glass relative w-full max-w-lg transform overflow-hidden text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg mt-4 sm:mt-0',
              className
            )}
            {...props}
          >
            <button
              onClick={onClose}
              className="absolute right-2 top-2 z-20 p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavarage-coral focus:ring-offset-2 shadow-lg backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
