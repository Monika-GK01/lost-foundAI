import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setSubmitted(true);
    toast.success('If an account exists, a reset link has been sent.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">LF</Link>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div className="card text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              If an account exists for <span className="font-medium text-[var(--color-text)]">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="btn-primary mt-4">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@college.edu"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
