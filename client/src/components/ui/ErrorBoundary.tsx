import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

/**
 * Route-level error boundary. Catches render-time exceptions anywhere in the
 * tree and shows a recoverable fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error in the console for debugging.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
        <div className="card flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertOctagon size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Unexpected error</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Something broke while rendering this page. You can try reloading or return to the dashboard.
            </p>
            {this.state.message && (
              <p className="mt-2 break-words rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {this.state.message}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={this.handleReset} className="btn-primary">
              <RefreshCw size={15} /> Try again
            </button>
            <a href="/dashboard" className="btn-secondary">
              <Home size={15} /> Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
