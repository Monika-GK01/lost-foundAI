import type { ReactNode } from 'react';

interface ScoreBarProps {
  label: string;
  /** Score in the range 0..1. */
  value: number;
  icon?: ReactNode;
}

/**
 * Horizontal confidence bar used to visualise a single match dimension.
 * Accepts a 0..1 value and renders it as a percentage.
 */
export function ScoreBar({ label, value, icon }: ScoreBarProps) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="flex w-5 items-center justify-center text-[var(--color-text-secondary)]">{icon}</span>
      )}
      <span className="w-24 text-xs text-[var(--color-text-secondary)]">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-medium">{pct}%</span>
    </div>
  );
}
