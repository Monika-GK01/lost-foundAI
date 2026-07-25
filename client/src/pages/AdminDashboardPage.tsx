import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Search, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { adminApi, claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { timeAgo } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['claims', 'pending'],
    queryFn: () => claimsApi.getPending({ page: 1, limit: 5 }),
  });

  const analytics = analyticsData?.data?.data;
  const pendingClaims = pendingData?.data?.data?.data ?? [];
  const isLoading = analyticsLoading || pendingLoading;

  const stats = [
    { label: 'Total Lost Items', value: analytics?.totalLostItems ?? 0, icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Found Items', value: analytics?.totalFoundItems ?? 0, icon: Search, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Pending Claims', value: analytics?.pendingClaims ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Recovered Items', value: analytics?.recoveredItems ?? 0, icon: CheckCircle, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Overview of campus lost & found activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <TrendingUp size={20} className="mx-auto text-primary-600" />
          <p className="mt-2 text-xl font-bold">{analytics?.claimsToday ?? 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Claims Today</p>
        </div>
        <div className="card text-center">
          <FileText size={20} className="mx-auto text-primary-600" />
          <p className="mt-2 text-xl font-bold">{analytics?.averageResolutionTimeHours ?? 0}h</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Avg Resolution Time</p>
        </div>
        <div className="card text-center">
          <CheckCircle size={20} className="mx-auto text-primary-600" />
          <p className="mt-2 text-xl font-bold">{analytics?.recoveredItems ?? 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Items Recovered</p>
        </div>
      </div>

      {/* Pending Claims */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pending Claims</h2>
          <Link to="/admin/claims" className="text-sm font-medium text-primary-600 hover:underline">Review all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : pendingClaims.length === 0 ? (
          <div className="card py-8 text-center text-sm text-[var(--color-text-secondary)]">No pending claims. All caught up!</div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <Link key={claim._id} to={`/admin/claims/${claim._id}`} className="card flex items-center justify-between py-4 transition-all hover:shadow-md">
                <div>
                  <p className="font-medium">{typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Item'}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {typeof claim.student === 'object' ? claim.student.name : 'Student'} • {timeAgo(claim.createdAt)}
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Top Categories */}
      {analytics?.topCategories && analytics.topCategories.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-semibold">Top Categories</h3>
          <div className="space-y-2">
            {analytics.topCategories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-sm">
                <span>{cat.category}</span>
                <span className="font-medium">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
