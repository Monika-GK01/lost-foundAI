import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind classes for the icon bubble (text + background). */
  accent?: string;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, accent, hint }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          accent ?? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30'
        )}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-2xl font-bold">{value}</p>
        <p className="truncate text-xs text-[var(--color-text-secondary)]">{label}</p>
        {hint && <p className="truncate text-[11px] text-[var(--color-text-secondary)]">{hint}</p>}
      </div>
    </div>
  );
}
