import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ShieldAlert size={32} className="text-red-600" />
      </div>
      <h1 className="text-5xl font-bold text-red-600">403</h1>
      <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
      <p className="mt-2 max-w-md text-[var(--color-text-secondary)]">
        You don't have permission to access this page. Contact your administrator if you believe this is an error.
      </p>
      <Link to="/dashboard" className="btn-primary mt-8">Go to Dashboard</Link>
    </div>
  );
}
