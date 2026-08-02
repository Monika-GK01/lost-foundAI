import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(name?: string): string {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    CLAIMED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    RETURNED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    NEEDS_REVIEW: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTrustTier(score: number): { label: string; color: string; badge: string } {
  if (score >= 80) return { label: 'Platinum', color: 'text-violet-600', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' };
  if (score >= 60) return { label: 'Gold', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
  if (score >= 40) return { label: 'Silver', color: 'text-gray-500', badge: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
  return { label: 'Bronze', color: 'text-orange-700', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' };
}
