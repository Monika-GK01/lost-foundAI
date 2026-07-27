import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { lostItemsApi, foundItemsApi } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ItemCard } from '@/components/ui/ItemCard';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import toast from 'react-hot-toast';
import type { AxiosResponse } from 'axios';
import type { LostItem, FoundItem, ApiResponse, PaginatedData } from '@/types';

interface ItemListContentProps {
  type: 'lost' | 'found';
}

export function ItemListContent({ type }: ItemListContentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLost = type === 'lost';
  const api = isLost ? lostItemsApi : foundItemsApi;

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const params: Record<string, string | number | undefined> = {
    page,
    limit: 12,
    keyword: searchParams.get('keyword') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    color: searchParams.get('color') ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    sortOrder: searchParams.get('sortOrder') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['items', type, params],
    queryFn: () =>
      api.getAll(params) as Promise<AxiosResponse<ApiResponse<PaginatedData<LostItem | FoundItem>>>>,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', type] });
      toast.success('Item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const items = (data?.data?.data?.data ?? []) as (LostItem | FoundItem)[];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (p: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      },
      { replace: true }
    );
  };

  const isAdmin = user?.role !== 'STUDENT';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{isLost ? 'Lost Items' : 'Found Items'}</h1>
        <Link to={isLost ? '/lost-items/new' : '/found-items/new'} className="btn-primary">
          <Plus size={16} /> {isLost ? 'Report Lost Item' : 'Report Found Item'}
        </Link>
      </div>

      <SearchFilterBar placeholder={`Search ${isLost ? 'lost' : 'found'} items...`} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title={`No ${isLost ? 'lost' : 'found'} items found`}
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              type={type}
              currentUserId={user?._id}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
