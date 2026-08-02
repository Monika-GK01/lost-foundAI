import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  UserPlus,
  BarChart3,
  Bell,
} from 'lucide-react';
import { adminApi, claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/charts/StatCard';
import { MonthlyItemsChart, CategoryPieChart, RecoveryAreaChart } from '@/components/ui/charts/Charts';
import { timeAgo } from '@/lib/utils';

export default function AdminOverviewPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['claims', 'pending'],
    queryFn: () => claimsApi.getPending({ page: 1, limit: 5 }),
  });

  const a = analyticsData?.data?.data;
  const pendingClaims = pendingData?.data?.data?.data ?? [];
  const isLoading = analyticsLoading || pendingLoading;

  const stats = [
    { label: 'Total Users', value: a?.totalUsers ?? 0, icon: Users, accent: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Lost Items', value: a?.totalLostItems ?? 0, icon: Package, accent: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    { label: 'Found Items', value: a?.totalFoundItems ?? 0, icon: Search, accent: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Pending Claims', value: a?.pendingClaims ?? 0, icon: Clock, accent: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Recovered', value: a?.recoveredItems ?? 0, icon: CheckCircle2, accent: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Rejected', value: a?.rejectedClaims ?? 0, icon: XCircle, accent: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Recovery Rate', value: `${a?.recoveryRate ?? 0}%`, icon: TrendingUp, accent: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
    { label: 'Avg Match Score', value: `${a?.averageMatchScore ?? 0}%`, icon: Sparkles, accent: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Campus lost & found activity at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/claims?status=PENDING" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
          <Zap size={14} /> Review Claims
        </Link>
        <Link to="/admin/users" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
          <UserPlus size={14} /> Manage Users
        </Link>
        <Link to="/admin/reports" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
          <BarChart3 size={14} /> Reports
        </Link>
        <Link to="/notifications" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
          <Bell size={14} /> Notifications
        </Link>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          ))}
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyItemsChart data={a?.monthlyItems ?? []} />
          <CategoryPieChart data={a?.categoryDistribution ?? a?.topCategories ?? []} />
          <RecoveryAreaChart data={a?.monthlyItems ?? []} />
          <div className="card">
            <h3 className="mb-4 font-semibold">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <FileText size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">{a?.claimsToday ?? 0}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Claims Today</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <Clock size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">{a?.averageResolutionTimeHours ?? 0}h</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Avg Resolution</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <CheckCircle2 size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">{a?.approvedClaims ?? 0}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Approved Claims</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <Users size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">{a?.totalUsers ?? 0}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Registered Users</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <ShieldCheck size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">
                  {a?.trustScoreDistribution?.length
                    ? `${Math.round(a.trustScoreDistribution.reduce((sum, d) => sum + d.count, 0) / (a.totalUsers || 1))}`
                    : '—'}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Trust Distribution</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                <Sparkles size={20} className="mx-auto text-primary-600" />
                <p className="mt-2 text-xl font-bold">{a?.averageMatchScore ?? 0}%</p>
                <p className="text-xs text-[var(--color-text-secondary)]">AI Match Avg</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity + pending claims */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Pending Claims</h3>
            <Link to="/admin/claims?status=PENDING" className="text-sm font-medium text-primary-600 hover:underline">
              Review all
            </Link>
          </div>
          {pendingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : pendingClaims.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">No pending claims. All caught up!</p>
          ) : (
            <div className="space-y-2">
              {pendingClaims.map((claim) => (
                <Link
                  key={claim._id}
                  to={`/admin/claims/${claim._id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Item'}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {typeof claim.student === 'object' ? claim.student.name : 'Student'} • {timeAgo(claim.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={claim.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Recent Activity</h3>
          {analyticsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !a?.recentActivity || a.recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {a.recentActivity.map((act) => (
                <div
                  key={`${act.type}-${act._id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{act.title}</p>
                    <p className="text-xs capitalize text-[var(--color-text-secondary)]">
                      {act.type} • {timeAgo(act.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
