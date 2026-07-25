import { type ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-400 dark:text-gray-500">{icon}</div>}
      <h3 className="text-lg font-medium text-[var(--color-text)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h3 className="text-lg font-medium text-[var(--color-text)]">Something went wrong</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{message || 'An unexpected error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}
