import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials } from '@/lib/utils';
import { Moon, Sun, ShieldCheck, Mail, Building2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();

  const collegeName =
    typeof user?.college === 'object' ? user.college.name : '—';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your administrator account and preferences.
        </p>
      </div>

      {/* Profile */}
      <div className="card space-y-4">
        <h3 className="font-semibold">Administrator Profile</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {user?.role?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Mail size={14} /> {user?.email}
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Building2 size={14} /> {collegeName}
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <ShieldCheck size={14} /> {user?.role?.replace(/_/g, ' ')}
          </div>
        </dl>
      </div>

      {/* Appearance */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-medium">Appearance</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Switch between light and dark theme.
          </p>
        </div>
        <button onClick={toggle} className="btn-secondary inline-flex items-center gap-2">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}
