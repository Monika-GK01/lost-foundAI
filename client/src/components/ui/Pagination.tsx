import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
      >
        <ChevronLeft size={18} />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">1</button>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            p === page
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
