import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Lock, Package, Search, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, authApi, claimsApi, lostItemsApi, foundItemsApi } from '@/lib/services';
import { getInitials, formatDate, getTrustTier } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    department: user?.department ?? '',
    year: user?.year ?? '',
    rollNumber: user?.rollNumber ?? '',
  });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });

  const userId = user?._id;

  const { data: claimsData } = useQuery({
    queryKey: ['my-claims-profile', userId],
    queryFn: () => claimsApi.getMy({ page: 1, limit: 5 }),
    enabled: !!userId,
  });
  const { data: lostData } = useQuery({
    queryKey: ['my-lost-profile', userId],
    queryFn: () => lostItemsApi.getAll({ owner: userId, page: 1, limit: 5 }),
    enabled: !!userId,
  });
  const { data: foundData } = useQuery({
    queryKey: ['my-found-profile', userId],
    queryFn: () => foundItemsApi.getAll({ finder: userId, page: 1, limit: 5 }),
    enabled: !!userId,
  });

  const claims = claimsData?.data?.data?.data ?? [];
  const lostItems = lostData?.data?.data?.data ?? [];
  const foundItems = foundData?.data?.data?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.update(user!._id, {
        name: form.name,
        phone: form.phone,
        department: form.department,
        year: form.year ? Number(form.year) : undefined,
        rollNumber: form.rollNumber,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
    onSuccess: () => {
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to change password');
    },
  });

  if (!user) return null;

  const collegeName = typeof user.college === 'object' ? user.college.name : user.college;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Identity card */}
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <ShieldCheck size={12} /> {user.role.replace(/_/g, ' ')}
            </span>
            {collegeName && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {collegeName}
              </span>
            )}
            <span className="text-xs text-[var(--color-text-secondary)]">Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Trust score */}
      <div className="card">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Trust Score</span>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTrustTier(user.trustScore).badge}`}>
              {getTrustTier(user.trustScore).label}
            </span>
            <span className="text-2xl font-bold text-primary-600">{user.trustScore}</span>
          </div>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${user.trustScore}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          Your trust score reflects verified recoveries and successful claims.
        </p>
      </div>

      {/* Personal information */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Personal Information</h3>
          {!editing && (
            <button
              onClick={() => {
                setForm({
                  name: user.name,
                  phone: user.phone ?? '',
                  department: user.department ?? '',
                  year: user.year ?? '',
                  rollNumber: user.rollNumber ?? '',
                });
                setEditing(true);
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Year</label>
                <input type="number" min={1} max={6} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Roll Number</label>
                <input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Department" value={user.department} />
            <InfoRow label="Roll Number" value={user.rollNumber} />
            <InfoRow label="Year" value={user.year ? String(user.year) : ''} />
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card space-y-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <Lock size={16} /> Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
            {passwordMutation.isPending ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Activity overview */}
      <div className="card space-y-4">
        <h3 className="font-semibold">Activity</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <ActivityTile icon={<FileText size={18} />} label="My Claims" count={claims.length} to="/claims" />
          <ActivityTile icon={<Package size={18} />} label="Lost Items" count={lostItems.length} to="/lost-items" />
          <ActivityTile icon={<Search size={18} />} label="Found Items" count={foundItems.length} to="/found-items" />
        </div>

        {claims.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Recent Claims</p>
            <div className="space-y-2">
              {claims.map((claim) => (
                <Link
                  key={claim._id}
                  to="/claims"
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <span className="truncate">
                    {typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Claim'}
                  </span>
                  <StatusBadge status={claim.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}

function ActivityTile({ icon, label, count, to }: { icon: React.ReactNode; label: string; count: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{count}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      </div>
    </Link>
  );
}
