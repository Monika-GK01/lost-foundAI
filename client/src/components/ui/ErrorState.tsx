import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Inline error display with an optional retry action. Used for failed queries
 * and fetch errors across list/detail pages.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('card flex flex-col items-center gap-3 py-12 text-center', className)} role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle size={28} />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
