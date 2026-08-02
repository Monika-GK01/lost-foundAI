import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      // login() sets user in context; we need to check role after
      // The auth context stores user, but we can't read it synchronously here.
      // Instead, call /me to get the fresh user and check role.
      const { authApi } = await import('@/lib/services');
      const res = await authApi.me();
      const user = res.data.data;

      if (!user || user.role === 'STUDENT') {
        // Student attempted admin login — reject and log out
        await logout();
        toast.error('This portal is for administrators only.');
        navigate('/login');
        return;
      }

      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Admin branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-1 text-sm text-gray-400">Campus Lost &amp; Found — Administration</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-gray-700/50 bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Admin Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="admin@college.edu"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Student?{' '}
          <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 hover:underline">
            Go to Student Login
          </Link>
        </p>
      </div>
    </div>
  );
}
