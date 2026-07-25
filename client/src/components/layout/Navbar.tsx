import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Bell, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">LF</div>
            <span className="hidden text-lg font-semibold sm:block">LostFound AI</span>
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="input-field pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/lost-items?keyword=${(e.target as HTMLInputElement).value}`);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800" title="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <>
              <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell size={18} />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                >
                  {getInitials(user.name)}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
                    <div className="border-b border-[var(--color-border)] px-4 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{user.role.replace(/_/g, ' ')}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      <User size={14} /> Profile
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
