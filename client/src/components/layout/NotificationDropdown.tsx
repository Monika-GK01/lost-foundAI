import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { notificationsApi } from '@/lib/services';
import { timeAgo, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Poll unread count for the badge.
  const { data: countData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });
  const unreadCount = countData?.data?.data?.unreadCount ?? 0;

  // Fetch the preview list only when the panel is open.
  const { data: listData } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => notificationsApi.getAll({ page: 1, limit: 6 }),
    enabled: open,
  });
  const notifications = listData?.data?.data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      invalidate();
      toast.success('All notifications marked as read');
    },
  });

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox size={28} className="text-[var(--color-text-secondary)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => !notif.isRead && markRead.mutate(notif._id)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/60',
                    !notif.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm', !notif.isRead ? 'font-semibold' : 'font-medium')}>
                      {notif.title}
                    </span>
                    {!notif.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                  </div>
                  <span className="line-clamp-2 text-xs text-[var(--color-text-secondary)]">{notif.message}</span>
                  <span className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{timeAgo(notif.createdAt)}</span>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--color-border)] px-4 py-2.5 text-center text-sm font-medium text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
