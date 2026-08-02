import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Tag, Palette, ArrowLeft, Sparkles } from 'lucide-react';
import { lostItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function LostItemDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['lost-item', id],
    queryFn: () => lostItemsApi.getById(id!),
    enabled: !!id,
  });

  const item = data?.data?.data;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  if (!item) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Item not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/lost-items" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-primary-600">
        <ArrowLeft size={14} /> Back to Lost Items
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-100 dark:bg-gray-800">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${item.images?.[0] ? 'hidden' : 'flex'} h-full items-center justify-center text-[var(--color-text-secondary)]`}>No Image</div>
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2">
              {item.images.slice(1).map((img, i) => (
                <div key={i} className="h-16 w-16 overflow-hidden rounded-lg border border-[var(--color-border)]">
                  <img src={img} alt={`${item.title} ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <StatusBadge status={item.status} />
          </div>

          <p className="text-[var(--color-text-secondary)]">{item.description}</p>

          <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-3 text-sm">
              <Tag size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">Category:</span>
              <span className="font-medium">{item.category}</span>
            </div>
            {item.brand && (
              <div className="flex items-center gap-3 text-sm">
                <Tag size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Brand:</span>
                <span className="font-medium">{item.brand}</span>
              </div>
            )}
            {item.color && (
              <div className="flex items-center gap-3 text-sm">
                <Palette size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Color:</span>
                <span className="font-medium">{item.color}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">Location:</span>
              <span className="font-medium">{item.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">Date Lost:</span>
              <span className="font-medium">{formatDate(item.dateLost)}</span>
            </div>
            {item.reward && (
              <div className="flex items-center gap-3 text-sm">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-[var(--color-text-secondary)]">Reward:</span>
                <span className="font-medium text-amber-600">{item.reward}</span>
              </div>
            )}
          </div>

          <Link to={`/lost-items/${item._id}/matches`} className="btn-primary w-full">
            <Sparkles size={16} /> View AI Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
