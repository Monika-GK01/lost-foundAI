import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { lostItemsApi, foundItemsApi, claimsApi, adminApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/charts/StatCard';
import { timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: lostData } = useQuery({
    queryKey: ['lost-items', 'campus'],
    queryFn: () => lostItemsApi.getAll({ page: 1, limit: 1 }),
  });

  const { data: foundData, isLoading: foundLoading } = useQuery({
    queryKey: ['found-items', 'recent'],
    queryFn: () => foundItemsApi.getAll({ page: 1, limit: 4 }),
  });

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['claims', 'my'],
    queryFn: () => claimsApi.getMy({ page: 1, limit: 5 }),
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => adminApi.getNotifications({ page: 1, limit: 4 }),
  });

  const myClaims = claimsData?.data?.data?.data ?? [];
  const pendingClaims = myClaims.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;
  const recoveredClaims = myClaims.filter((c) => c.status === 'APPROVED' || c.recoveryTimestamp).length;
  const recentFound = foundData?.data?.data?.data ?? [];
  const notifications = notifData?.data?.data?.data ?? [];

  const stats = [
    { label: 'Campus Lost Items', value: lostData?.data?.data?.total ?? 0, icon: Package, accent: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    { label: 'Campus Found Items', value: foundData?.data?.data?.total ?? 0, icon: Search, accent: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'My Claims', value: claimsData?.data?.data?.total ?? 0, icon: FileText, accent: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Pending Claims', value: pendingClaims, icon: Clock, accent: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Recovered', value: recoveredClaims, icon: CheckCircle2, accent: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
  ];

  const quickActions = [
    { label: 'Report Lost Item', desc: 'Lost something? Report it here.', to: '/lost-items/new', icon: Plus, accent: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    { label: 'Report Found Item', desc: 'Found something? Help return it.', to: '/found-items/new', icon: Search, accent: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { label: 'Browse Lost Items', desc: 'Search items reported lost.', to: '/lost-items', icon: Package, accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    { label: 'My Claims', desc: 'Track your submitted claims.', to: '/claims', icon: FileText, accent: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Here's what's happening with your items.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="card group transition-all hover:border-primary-300 hover:shadow-md">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${action.accent}`}>
                <action.icon size={20} />
              </div>
              <h3 className="font-semibold group-hover:text-primary-600">{action.label}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Claims + Notifications */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Claims</h2>
            <Link to="/claims" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {claimsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : myClaims.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">No claims yet.</p>
          ) : (
            <div className="space-y-2">
              {myClaims.map((claim) => (
                <Link
                  key={claim._id}
                  to={`/claims/${claim._id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Item'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{timeAgo(claim.createdAt)}</p>
                  </div>
                  <StatusBadge status={claim.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Bell size={16} className="text-primary-600" /> Recent Notifications
            </h2>
            <Link to="/notifications" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">You're all caught up!</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`rounded-lg border border-[var(--color-border)] p-3 ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
                >
                  <p className={`truncate text-sm ${!n.isRead ? 'font-semibold' : 'font-medium text-[var(--color-text-secondary)]'}`}>
                    {n.title}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{n.message}</p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently found */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles size={18} className="text-primary-600" /> Recently Found on Campus
          </h2>
          <Link to="/found-items" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
            Browse all <ArrowRight size={13} />
          </Link>
        </div>
        {foundLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
        ) : recentFound.length === 0 ? (
          <div className="card py-8 text-center text-sm text-[var(--color-text-secondary)]">No found items reported yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentFound.map((item) => (
              <Link key={item._id} to={`/found-items/${item._id}`} className="card group overflow-hidden p-0 transition-all hover:shadow-md">
                <div className="h-32 w-full bg-gray-100 dark:bg-gray-800">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-secondary)]">No Image</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="truncate font-medium group-hover:text-primary-600">{item.title}</h3>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{item.location || item.category}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
