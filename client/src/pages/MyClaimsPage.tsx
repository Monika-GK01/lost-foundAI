import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/lib/utils';

export default function MyClaimsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['claims', 'my', page],
    queryFn: () => claimsApi.getMy({ page, limit: 10 }),
  });

  const claims = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Claims</h1>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : claims.length === 0 ? (
        <EmptyState title="No claims yet" description="When you claim a found item, it will appear here." />
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Link key={claim._id} to={`/claims/${claim._id}`} className="card flex items-center justify-between py-4 transition-all hover:shadow-md">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {typeof claim.lostItem === 'object' ? claim.lostItem.title : 'Lost Item'} → {typeof claim.foundItem === 'object' ? claim.foundItem.title : 'Found Item'}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Submitted {timeAgo(claim.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                {claim.aiMatchScore > 0 && (
                  <span className="hidden text-xs text-[var(--color-text-secondary)] sm:block">{claim.aiMatchScore}% match</span>
                )}
                <StatusBadge status={claim.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
