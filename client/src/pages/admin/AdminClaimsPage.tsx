import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, ChevronRight } from 'lucide-react';
import { claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo, cn } from '@/lib/utils';
import type { Claim } from '@/types';

const TABS = [
  { label: 'Pending', status: 'PENDING' },
  { label: 'Needs Review', status: 'NEEDS_REVIEW' },
  { label: 'Approved', status: 'APPROVED' },
  { label: 'Rejected', status: 'REJECTED' },
] as const;

export default function AdminClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') ?? 'PENDING';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-claims', activeStatus, page],
    queryFn: () => claimsApi.getCollege({ status: activeStatus, page, limit: 10 }),
  });

  const claims = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;
  const total = data?.data?.data?.total ?? 0;

  const handleTabChange = (status: string) => {
    setSearchParams({ status });
    setPage(1);
  };

  const filtered = search
    ? claims.filter((c: Claim) => {
        const student = typeof c.student === 'object' ? c.student.name : '';
        const lost = typeof c.lostItem === 'object' ? c.lostItem.title : '';
        const found = typeof c.foundItem === 'object' ? c.foundItem.title : '';
        const q = search.toLowerCase();
        return (
          student.toLowerCase().includes(q) ||
          lost.toLowerCase().includes(q) ||
          found.toLowerCase().includes(q) ||
          c._id.toLowerCase().includes(q)
        );
      })
    : claims;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Claim Management</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Review and manage ownership claims submitted by students.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            onClick={() => handleTabChange(tab.status)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              activeStatus === tab.status
                ? 'text-primary-600'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            {tab.label}
            {activeStatus === tab.status && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-600" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder="Search by student, item, or ID..."
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${activeStatus.replace(/_/g, ' ').toLowerCase()} claims`}
          description={search ? 'Try adjusting your search.' : 'Claims will appear here as students submit them.'}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {total} claim{total !== 1 ? 's' : ''} • showing page {page}
          </p>
          {filtered.map((claim: Claim) => {
            const student = typeof claim.student === 'object' ? claim.student : null;
            const lost = typeof claim.lostItem === 'object' ? claim.lostItem : null;
            const found = typeof claim.foundItem === 'object' ? claim.foundItem : null;
            return (
              <div
                key={claim._id}
                className="card flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{lost?.title ?? 'Lost item'}</span>
                    <ChevronRight size={14} className="shrink-0 text-[var(--color-text-secondary)]" />
                    <span className="truncate font-medium">{found?.title ?? 'Found item'}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
                    #{claim._id.slice(-6).toUpperCase()} • {student?.name ?? 'Unknown student'} •{' '}
                    {timeAgo(claim.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {claim.aiMatchScore > 0 && (
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-semibold',
                        claim.aiMatchScore >= 70
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : claim.aiMatchScore >= 40
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      )}
                    >
                      {claim.aiMatchScore}% match
                    </span>
                  )}
                  <StatusBadge status={claim.status} />
                  <Link
                    to={`/admin/claims/${claim._id}`}
                    className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                  >
                    <Eye size={14} /> Review
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
