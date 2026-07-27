import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Trash2, Package, MapPin } from 'lucide-react';
import { lostItemsApi, foundItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { AxiosResponse } from 'axios';
import type { LostItem, FoundItem, ApiResponse, PaginatedData } from '@/types';

type AdminItem = LostItem | FoundItem;

interface AdminItemsPageProps {
  type: 'lost' | 'found';
}

export default function AdminItemsPage({ type }: AdminItemsPageProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const api = type === 'lost' ? lostItemsApi : foundItemsApi;
  const isLost = type === 'lost';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-items', type, page, search, status],
    queryFn: () =>
      api.getAll({
        page,
        limit: 12,
        search: search || undefined,
        status: status || undefined,
      }) as Promise<AxiosResponse<ApiResponse<PaginatedData<AdminItem>>>>,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items', type] });
      toast.success('Item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const items = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;
  const total = data?.data?.data?.total ?? 0;

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const statusOptions = isLost
    ? ['OPEN', 'CLAIMED', 'RETURNED', 'CLOSED']
    : ['OPEN', 'CLAIMED', 'RETURNED', 'CLOSED'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isLost ? 'Lost Items' : 'Found Items'}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage all {isLost ? 'lost' : 'found'} items reported across the campus.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-9"
            placeholder={`Search ${isLost ? 'lost' : 'found'} items...`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field sm:w-48"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title={`No ${isLost ? 'lost' : 'found'} items`}
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {total} item{total !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item: AdminItem) => {
              const detailPath = isLost ? `/lost-items/${item._id}` : `/found-items/${item._id}`;
              const date = isLost ? (item as { dateLost: string }).dateLost : (item as { dateFound: string }).dateFound;
              return (
                <div key={item._id} className="card group overflow-hidden p-0">
                  <div className="h-40 w-full bg-gray-100 dark:bg-gray-800">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span>{item.category}</span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {item.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{formatDate(date)}</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={detailPath}
                        className="btn-secondary inline-flex flex-1 items-center justify-center gap-1 px-3 py-1.5 text-xs"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
