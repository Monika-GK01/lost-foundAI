import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/lib/services';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; college: string; role?: string; department?: string; year?: number; rollNumber?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data.success && res.data.data) {
      setUser(res.data.data);
    }
  };

  const register = async (data: { name: string; email: string; password: string; college: string; role?: string; department?: string; year?: number; rollNumber?: string; phone?: string }) => {
    const res = await authApi.register(data);
    if (res.data.success && res.data.data) {
      setUser(res.data.data);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      // silent
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
