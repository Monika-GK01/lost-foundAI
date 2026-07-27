import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Search,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials, cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Optional exact-match search string used to determine active state for tabbed routes. */
  search?: string;
  /** Whether the link must match the pathname exactly (used for the overview root). */
  end?: boolean;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Claims',
    items: [
      { label: 'Pending Claims', to: '/admin/claims', icon: Clock, search: 'status=PENDING' },
      { label: 'Needs Review', to: '/admin/claims', icon: AlertCircle, search: 'status=NEEDS_REVIEW' },
      { label: 'Approved Claims', to: '/admin/claims', icon: CheckCircle2, search: 'status=APPROVED' },
      { label: 'Rejected Claims', to: '/admin/claims', icon: XCircle, search: 'status=REJECTED' },
    ],
  },
  {
    title: 'Items',
    items: [
      { label: 'Lost Items', to: '/admin/lost-items', icon: Package },
      { label: 'Found Items', to: '/admin/found-items', icon: Search },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Reports & Analytics', to: '/admin/analytics', icon: BarChart3 },
      { label: 'Reports Export', to: '/admin/reports', icon: FileText },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
];

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation();
  const Icon = item.icon;

  // Determine active state. For tabbed claim links, match pathname + search.
  const pathMatches = item.end
    ? location.pathname === item.to
    : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  const searchMatches = item.search
    ? location.search.includes(item.search)
    : true;
  const isActive = pathMatches && searchMatches && (item.search ? location.pathname === item.to : true);

  const to = item.search ? `${item.to}?${item.search}` : item.to;

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text)] dark:hover:bg-gray-800'
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <ShieldCheck size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">LostFound AI</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Admin Portal</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarLink key={`${item.to}-${item.search ?? ''}`} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[var(--color-surface)] shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold">Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}</p>
              <p className="hidden text-xs text-[var(--color-text-secondary)] sm:block">
                {user?.role?.replace(/_/g, ' ') ?? 'Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 sm:block"
            >
              Student View
            </Link>
            <NotificationDropdown />
            <button
              onClick={toggle}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {getInitials(user?.name)}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main role="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
