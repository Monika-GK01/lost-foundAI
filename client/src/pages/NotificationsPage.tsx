import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { timeAgo, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getAll({ page, limit: 20 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
  };

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      invalidate();
      toast.success('All notifications marked as read');
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });

  const all = data?.data?.data?.data ?? [];
  const unreadCount = data?.data?.data?.unreadCount ?? 0;
  const totalPages = data?.data?.data?.totalPages ?? 1;
  const notifications = unreadOnly ? all.filter((n) => !n.isRead) : all;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly((v) => !v)}
            className={cn('btn-secondary text-xs', unreadOnly && 'border-primary-500 text-primary-600')}
            aria-pressed={unreadOnly}
          >
            {unreadOnly ? 'Showing unread' : 'Unread only'}
          </button>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0}
            className="btn-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={unreadOnly ? 'No unread notifications' : 'No notifications'}
          description="You're all caught up!"
          icon={<Bell size={48} />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              role="button"
              tabIndex={0}
              onClick={() => !notif.isRead && markRead.mutate(notif._id)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !notif.isRead) {
                  e.preventDefault();
                  markRead.mutate(notif._id);
                }
              }}
              className={cn(
                'card cursor-pointer py-4 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                !notif.isRead && 'border-l-4 border-l-primary-500'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                  <div>
                    <p className={cn('text-sm', !notif.isRead ? 'font-semibold' : 'font-medium text-[var(--color-text-secondary)]')}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{notif.message}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{timeAgo(notif.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
