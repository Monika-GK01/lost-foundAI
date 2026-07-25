import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/services';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    department: user?.department ?? '',
  });

  const mutation = useMutation({
    mutationFn: () => usersApi.update(user!._id, form),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Avatar + Info */}
      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Trust Score */}
      <div className="card">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Trust Score</span>
          <span className="text-2xl font-bold text-primary-600">{user.trustScore}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${user.trustScore}%` }} />
        </div>
      </div>

      {/* Editable Fields */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Personal Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm font-medium text-primary-600 hover:underline">Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Name</span><span className="font-medium">{user.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Email</span><span className="font-medium">{user.email}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Phone</span><span className="font-medium">{user.phone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Department</span><span className="font-medium">{user.department || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Roll Number</span><span className="font-medium">{user.rollNumber || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Year</span><span className="font-medium">{user.year || '—'}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
