import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search as SearchIcon, Users, Ban, CheckCircle2, Trash2, History, X } from 'lucide-react';
import { usersApi, claimsApi } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials, formatDate, cn } from '@/lib/utils';
import type { User, Claim } from '@/types';
import toast from 'react-hot-toast';

const ROLE_FILTERS = ['ALL', 'STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN'] as const;

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>('ALL');
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersApi.getAll({ page, limit: 12 }),
  });

  const users = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.setStatus(id, isActive),
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.isActive ? 'User enabled' : 'User disabled');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Search, view, and manage student and administrator accounts.
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                roleFilter === role
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              )}
            >
              {role === 'ALL' ? 'All' : role.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Users size={40} />} title="No users found" description="Try adjusting your search or filters." />
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Trust</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((u) => {
                const isSelf = currentUser?._id === u._id;
                return (
                  <tr key={u._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            getInitials(u.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="truncate text-xs text-[var(--color-text-secondary)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{u.department || '—'}</td>
                    <td className="px-4 py-3 font-medium">{u.trustScore}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          u.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        )}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setHistoryUser(u)}
                          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label={`View claim history for ${u.name}`}
                          title="Claim history"
                        >
                          <History size={16} />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => statusMutation.mutate({ id: u._id, isActive: !u.isActive })}
                              className={cn(
                                'rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800',
                                u.isActive ? 'text-orange-600' : 'text-green-600'
                              )}
                              aria-label={u.isActive ? `Disable ${u.name}` : `Enable ${u.name}`}
                              title={u.isActive ? 'Disable' : 'Enable'}
                            >
                              {u.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label={`Delete ${u.name}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {historyUser && <ClaimHistoryModal user={historyUser} onClose={() => setHistoryUser(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Delete user</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Are you sure you want to permanently delete <span className="font-medium text-[var(--color-text)]">{confirmDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete._id)}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimHistoryModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-claim-history', user._id],
    queryFn: () => claimsApi.getCollege({ page: 1, limit: 100 }),
  });

  const all = data?.data?.data?.data ?? [];
  const claims = all.filter((c) => (typeof c.student === 'object' ? c.student._id === user._id : false));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h3 className="font-semibold">Claim History</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : claims.length === 0 ? (
            <EmptyState icon={<History size={36} />} title="No claims" description="This user has not submitted any claims." />
          ) : (
            <div className="space-y-2">
              {claims.map((claim: Claim) => (
                <div key={claim._id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Claim'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {formatDate(claim.createdAt)} · Score {Math.round((claim.aiMatchScore ?? 0) * 100)}%
                    </p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
