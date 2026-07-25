import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = data?.data?.data;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!analytics) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">No analytics data available.</div>;
  }

  const maxCategory = Math.max(...analytics.topCategories.map((c) => c.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Campus lost & found insights</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{analytics.totalLostItems}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Total Lost Items</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{analytics.totalFoundItems}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Total Found Items</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{analytics.recoveredItems}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Items Recovered</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">{analytics.averageResolutionTimeHours}h</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Avg Resolution</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-primary-600" />
            <h3 className="font-semibold">Top Categories</h3>
          </div>
          <div className="space-y-3">
            {analytics.topCategories.map((cat) => (
              <div key={cat.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{cat.category}</span>
                  <span className="font-medium">{cat.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score Distribution */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600" />
            <h3 className="font-semibold">Trust Score Distribution</h3>
          </div>
          <div className="space-y-3">
            {analytics.trustScoreDistribution.map((dist) => (
              <div key={dist.range} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">{dist.range}</span>
                <span className="font-medium">{dist.count} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="mb-3 font-semibold">Summary</h3>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[var(--color-text-secondary)]">Pending Claims</p>
            <p className="text-lg font-bold">{analytics.pendingClaims}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Claims Today</p>
            <p className="text-lg font-bold">{analytics.claimsToday}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Recovery Rate</p>
            <p className="text-lg font-bold">
              {analytics.totalLostItems > 0 ? Math.round((analytics.recoveredItems / analytics.totalLostItems) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
