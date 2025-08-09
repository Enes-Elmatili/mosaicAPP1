/**
 * AuthContext.tsx
 * Fournit le contexte d'authentification (user, login, logout, signup).
 */
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Type utilisateur retourné par l'API
export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  effectivePermissions: string[];
};

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Fetches /api/me, tracks loading, error and version to allow invalidation on focus.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base URL for API requests; use env var or default to relative path
  const baseUrl = import.meta.env.VITE_API_ORIGIN ?? '';
  const authFetch = (input: RequestInfo, init?: RequestInit) => {
    const token = localStorage.getItem('token');
    const headers = {
      ...(init?.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json',
    } as Record<string, string>;
    // Allow relative or absolute URLs
    const url = typeof input === 'string' && !input.startsWith('http') ? `${baseUrl}${input}` : input;
    return fetch(url, { ...init, headers });
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        if (!res.ok) throw new Error(`Login failed (${res.status})`);
      }
      if (!res.ok) throw new Error(data?.error || `Login failed (${res.status})`);
      localStorage.setItem('token', data.token);
      // Fetch full user profile (roles and permissions)
      const meRes = await authFetch('/api/me');
      let meData: any;
      try {
        meData = await meRes.json();
      } catch {
        if (!meRes.ok) throw new Error(`Fetch user failed (${meRes.status})`);
      }
      if (!meRes.ok) throw new Error(meData?.error || `Fetch user failed (${meRes.status})`);
      setUser(meData);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        if (!res.ok) throw new Error(`Signup failed (${res.status})`);
      }
      if (!res.ok) throw new Error(data?.error || `Signup failed (${res.status})`);
      localStorage.setItem('token', data.token);
      // Fetch full user profile (roles and permissions)
      const meRes = await authFetch('/api/me');
      let meData: any;
      try {
        meData = await meRes.json();
      } catch {
        if (!meRes.ok) throw new Error(`Fetch user failed (${meRes.status})`);
      }
      if (!meRes.ok) throw new Error(meData?.error || `Fetch user failed (${meRes.status})`);
      setUser(meData);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally: fetch /api/me
      authFetch(`/api/me`)
        .then(async res => {
          if (res.ok) {
            try {
              const data = await res.json();
              setUser(data);
            } catch {
              logout();
            }
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
