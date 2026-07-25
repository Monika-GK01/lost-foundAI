import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().min(1, 'College is required'),
  department: z.string().optional(),
  year: z.coerce.number().optional(),
  rollNumber: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        college: data.college,
        department: data.department,
        year: data.year,
        rollNumber: data.rollNumber,
        phone: data.phone,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">LF</Link>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Join your campus lost & found community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input {...register('name')} className="input-field" placeholder="John Doe" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@college.edu" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">College ID</label>
            <input {...register('college')} className="input-field" placeholder="College ID" />
            {errors.college && <p className="mt-1 text-xs text-red-500">{errors.college.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Department</label>
              <input {...register('department')} className="input-field" placeholder="CSE" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Year</label>
              <input {...register('year')} type="number" className="input-field" placeholder="2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Roll Number</label>
              <input {...register('rollNumber')} className="input-field" placeholder="21CS101" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+91..." />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
