import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatCard } from '@/components/ui/charts/StatCard';
import { MonthlyItemsChart, CategoryPieChart, RecoveryAreaChart } from '@/components/ui/charts/Charts';
import { Package, Search, CheckCircle2, Clock, Users, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = data?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">No analytics data available.</div>;
  }

  const stats = [
    { label: 'Total Lost', value: analytics.totalLostItems, icon: Package, accent: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    { label: 'Total Found', value: analytics.totalFoundItems, icon: Search, accent: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Recovered', value: analytics.recoveredItems, icon: CheckCircle2, accent: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Avg Resolution', value: `${analytics.averageResolutionTimeHours}h`, icon: Clock, accent: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Total Users', value: analytics.totalUsers ?? 0, icon: Users, accent: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Avg Match', value: `${analytics.averageMatchScore ?? 0}%`, icon: Sparkles, accent: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Campus lost & found insights</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyItemsChart data={analytics.monthlyItems ?? []} />
        <CategoryPieChart data={analytics.categoryDistribution ?? analytics.topCategories} />
        <RecoveryAreaChart data={analytics.monthlyItems ?? []} />

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
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
            <p className="text-lg font-bold">{analytics.recoveryRate ?? 0}%</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Rejected Claims</p>
            <p className="text-lg font-bold">{analytics.rejectedClaims ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
