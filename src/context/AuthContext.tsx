import React, { createContext, useContext, ReactNode } from 'react';

// Simple auth context stub: holds current user's permissions
export type AuthUser = {
  id: string;
  roles: string[];
  effectivePermissions: string[];
  meVersion?: string;
};

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

/**
 * Fetches /api/me, tracks loading, error and version to allow invalidation on focus.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meVersion, setMeVersion] = useState<string>('');

  const loadMe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/me', { headers: { 'x-user-id': '1' } });
      if (!res.ok) throw new Error(`Me fetch failed (${res.status})`);
      const data = await res.json();
      const version = res.headers.get('etag') ?? '';
      setMeVersion(version);
      setUser({ ...data, meVersion: version });
    } catch (e: any) {
      setError(e.message || 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    const onFocus = () => {
      // reload on tab focus for freshness
      loadMe();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, reload: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}
