import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
      <p className="mt-2 max-w-md text-[var(--color-text-secondary)]">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">Go Home</Link>
    </div>
  );
}
