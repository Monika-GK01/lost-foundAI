import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { lostItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { LostItem } from '@/types';

export default function LostItemsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');

  const debounceTimer = useMemo(() => ({ current: null as ReturnType<typeof setTimeout> | null }), []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['lost-items', page, debouncedSearch, category],
    queryFn: () => lostItemsApi.getAll({ page, limit: 12, search: debouncedSearch || undefined, category: category || undefined }),
  });

  const items = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Lost Items</h1>
        <Link to="/lost-items/new" className="btn-primary"><Plus size={16} /> Report Lost Item</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-9"
            placeholder="Search lost items..."
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field sm:w-48">
          <option value="">All Categories</option>
          <option value="ELECTRONICS">Electronics</option>
          <option value="CLOTHING">Clothing</option>
          <option value="BOOKS">Books</option>
          <option value="ACCESSORIES">Accessories</option>
          <option value="DOCUMENTS">Documents</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No lost items found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: LostItem) => (
            <Link key={item._id} to={`/lost-items/${item._id}`} className="card group overflow-hidden p-0 transition-all hover:shadow-md">
              <div className="h-40 w-full bg-gray-100 dark:bg-gray-800">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">No Image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold group-hover:text-primary-600">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>{item.category}</span>
                  <span>{formatDate(item.dateLost)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
