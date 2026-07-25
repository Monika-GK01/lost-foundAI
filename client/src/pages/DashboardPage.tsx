import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Search, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { lostItemsApi, foundItemsApi, claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: lostData, isLoading: lostLoading } = useQuery({
    queryKey: ['lost-items', 'mine'],
    queryFn: () => lostItemsApi.getAll({ page: 1, limit: 5 }),
  });

  const { data: foundData, isLoading: foundLoading } = useQuery({
    queryKey: ['found-items', 'recent'],
    queryFn: () => foundItemsApi.getAll({ page: 1, limit: 5 }),
  });

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['claims', 'my'],
    queryFn: () => claimsApi.getMy({ page: 1, limit: 5 }),
  });

  const isLoading = lostLoading || foundLoading || claimsLoading;

  const stats = [
    { label: 'My Lost Items', value: lostData?.data?.data?.total ?? 0, icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Found Items', value: foundData?.data?.data?.total ?? 0, icon: Search, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'My Claims', value: claimsData?.data?.data?.total ?? 0, icon: FileText, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Trust Score', value: user?.trustScore ?? 0, icon: TrendingUp, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Here's what's happening with your items.</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/lost-items/new" className="card group transition-all hover:border-primary-300 hover:shadow-md">
          <h3 className="font-semibold group-hover:text-primary-600">Report Lost Item</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Lost something? Report it here.</p>
        </Link>
        <Link to="/found-items/new" className="card group transition-all hover:border-primary-300 hover:shadow-md">
          <h3 className="font-semibold group-hover:text-primary-600">Report Found Item</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Found something? Help someone get it back.</p>
        </Link>
      </div>

      {/* Recent Claims */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Claims</h2>
          <Link to="/claims" className="text-sm font-medium text-primary-600 hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : claimsData?.data?.data?.data?.length ? (
          <div className="space-y-3">
            {claimsData.data.data.data.map((claim) => (
              <Link key={claim._id} to={`/claims/${claim._id}`} className="card flex items-center justify-between py-4 transition-all hover:shadow-md">
                <div>
                  <p className="font-medium">{typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Item'}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{timeAgo(claim.createdAt)}</p>
                </div>
                <StatusBadge status={claim.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card py-8 text-center text-sm text-[var(--color-text-secondary)]">No claims yet.</div>
        )}
      </div>
    </div>
  );
}
