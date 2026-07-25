import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { adminApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => adminApi.getNotifications({ page, limit: 20 }),
  });

  const markAllRead = useMutation({
    mutationFn: () => adminApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.data?.data ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={() => markAllRead.mutate()} className="btn-secondary text-xs">
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon={<Bell size={48} />} />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markRead.mutate(notif._id)}
              className={`card cursor-pointer py-4 transition-all hover:shadow-sm ${!notif.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium text-[var(--color-text-secondary)]'}`}>{notif.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{notif.message}</p>
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
