import { createContext, useContext, useEffect, useState } from 'react';
import type { CurrentUser } from './types';

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  user: null,
  loading: true,
  error: null,
  reload: async () => {},
});

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await fetch('/api/me', { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      email: data.email,
      roles: data.roles || [],
      permissions: data.permissions || [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const u = await fetchCurrentUser();
    setUser(u);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, error, reload: load }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
