import { Link } from 'react-router-dom';
import { Eye, Sparkles, Pencil, Trash2, MapPin, User as UserIcon } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { LostItem, FoundItem } from '@/types';

interface ItemCardProps {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (id: string, title: string) => void;
}

function getOwnerId(item: LostItem | FoundItem, type: 'lost' | 'found'): string | undefined {
  const owner = type === 'lost' ? (item as LostItem).owner : (item as FoundItem).finder;
  if (!owner) return undefined;
  return typeof owner === 'object' ? owner._id : owner;
}

function getOwnerName(item: LostItem | FoundItem, type: 'lost' | 'found'): string | undefined {
  const owner = type === 'lost' ? (item as LostItem).owner : (item as FoundItem).finder;
  return typeof owner === 'object' ? owner.name : undefined;
}

export function ItemCard({ item, type, currentUserId, isAdmin, onDelete }: ItemCardProps) {
  const isLost = type === 'lost';
  const detailPath = isLost ? `/lost-items/${item._id}` : `/found-items/${item._id}`;
  const date = isLost ? (item as LostItem).dateLost : (item as FoundItem).dateFound;
  const ownerId = getOwnerId(item, type);
  const ownerName = getOwnerName(item, type);
  const canManage = isAdmin || (currentUserId && ownerId === currentUserId);

  return (
    <div className="card group flex flex-col overflow-hidden p-0 transition-all hover:shadow-md">
      <Link to={detailPath} className="block h-44 w-full bg-gray-100 dark:bg-gray-800">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">No Image</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={detailPath} className="font-semibold hover:text-primary-600">
            {item.title}
          </Link>
          <StatusBadge status={item.status} />
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{item.description}</p>

        <div className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium dark:bg-gray-800">{item.category}</span>
            {item.brand && <span>{item.brand}</span>}
          </div>
          {item.location && (
            <p className="flex items-center gap-1">
              <MapPin size={12} /> {item.location}
            </p>
          )}
          <p>{formatDate(date)}</p>
          {ownerName && (
            <p className="flex items-center gap-1">
              <UserIcon size={12} /> {isLost ? 'Reported by' : 'Found by'} {ownerName}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 pt-1">
          <Link
            to={detailPath}
            className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            <Eye size={14} /> View
          </Link>
          {isLost && (
            <Link
              to={`/lost-items/${item._id}/matches`}
              className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <Sparkles size={14} /> AI Match
            </Link>
          )}
          {canManage && (
            <>
              <Link
                to={detailPath}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                aria-label={`Edit ${item.title}`}
              >
                <Pencil size={14} /> Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(item._id, item.title)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
