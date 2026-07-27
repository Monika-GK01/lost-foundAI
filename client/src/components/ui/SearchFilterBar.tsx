import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['ELECTRONICS', 'CLOTHING', 'BOOKS', 'ACCESSORIES', 'DOCUMENTS', 'OTHER'];
const STATUSES = ['OPEN', 'CLAIMED', 'RETURNED', 'CLOSED'];
const SORTS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
];

interface SearchFilterBarProps {
  placeholder?: string;
}

/**
 * Search + filter + sort bar that persists its state to URL query params
 * (keyword, category, status, brand, color, dateFrom, dateTo, sortBy, sortOrder).
 */
export function SearchFilterBar({ placeholder = 'Search...' }: SearchFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce keyword into the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (keyword) next.set('keyword', keyword);
          else next.delete('keyword');
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, setSearchParams]);

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  };

  const clearAll = () => {
    setKeyword('');
    setSearchParams({}, { replace: true });
  };

  const [sortBy, sortOrder] = (searchParams.get('sortBy')
    ? `${searchParams.get('sortBy')}:${searchParams.get('sortOrder') ?? 'desc'}`
    : 'createdAt:desc'
  ).split(':');
  const activeSort = `${sortBy}:${sortOrder}`;
  const hasActiveFilters =
    !!searchParams.get('category') ||
    !!searchParams.get('status') ||
    !!searchParams.get('brand') ||
    !!searchParams.get('color') ||
    !!searchParams.get('dateFrom') ||
    !!searchParams.get('dateTo');

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input-field pl-9"
            placeholder={placeholder}
            aria-label="Search items"
          />
        </div>
        <select
          value={activeSort}
          onChange={(e) => {
            const [sb, so] = e.target.value.split(':');
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set('sortBy', sb);
                next.set('sortOrder', so);
                return next;
              },
              { replace: true }
            );
          }}
          className="input-field sm:w-48"
          aria-label="Sort items"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="btn-secondary inline-flex items-center justify-center gap-1"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="card grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Category</label>
            <select
              value={searchParams.get('category') ?? ''}
              onChange={(e) => setParam('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Status</label>
            <select
              value={searchParams.get('status') ?? ''}
              onChange={(e) => setParam('status', e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Brand</label>
            <input
              value={searchParams.get('brand') ?? ''}
              onChange={(e) => setParam('brand', e.target.value)}
              className="input-field"
              placeholder="e.g. Apple"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Color</label>
            <input
              value={searchParams.get('color') ?? ''}
              onChange={(e) => setParam('color', e.target.value)}
              className="input-field"
              placeholder="e.g. Black"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Date From</label>
            <input
              type="date"
              value={searchParams.get('dateFrom') ?? ''}
              onChange={(e) => setParam('dateFrom', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Date To</label>
            <input
              type="date"
              value={searchParams.get('dateTo') ?? ''}
              onChange={(e) => setParam('dateTo', e.target.value)}
              className="input-field"
            />
          </div>
          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
