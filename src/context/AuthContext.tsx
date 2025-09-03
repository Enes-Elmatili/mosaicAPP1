import { ReactNode, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { buildUrl } from "@/utils/api";
import { AuthContext } from "./auth-context"; // ✅ bon chemin

// Types cohérents avec le backend
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles: string[]; // tableau de rôles
  role: string; // rôle unique (fallback)
};

export type LoginResponse = {
  ok: boolean;
  token: string;
  user: AuthUser;
};

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  signup: (
    email: string,
    password: string,
    name: string,
    role: string
  ) => Promise<LoginResponse>;
  isAuthenticated: boolean;
}

// ✅ Normalise l’utilisateur pour que "roles" ne soit jamais vide
function normalizeUser(u: AuthUser): AuthUser {
  const roles = u.roles && u.roles.length > 0 ? u.roles : [u.role];
  return { ...u, roles };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const http = useCallback(
    async (endpoint: string, config: RequestInit = {}): Promise<unknown> => {
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...config.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(buildUrl(endpoint), {
        ...config,
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Erreur inconnue.";
        try {
          const err = JSON.parse(text) as { message?: string };
          message = err.message || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return res.json();
      }
      return {};
    },
    []
  );

  const logout = useCallback((): void => {
    localStorage.removeItem("authToken");
    setUser(null);
    setError(null);
    toast.success("Vous avez été déconnecté.");
  }, []);

  const checkAuth = useCallback(async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const data = (await http("/auth/me", { method: "GET" })) as {
        ok: boolean;
        user: AuthUser;
      };
      if (!data?.user) return null;

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      return normalized;
    } catch {
      logout();
      return null;
    }
  }, [http, logout]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      setLoading(true);
      setError(null);
      try {
        const data = (await http("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })) as LoginResponse;

        if (!data?.token || !data?.user) {
          throw new Error("Réponse invalide du serveur.");
        }

        localStorage.setItem("authToken", data.token);
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        toast.success("Connexion réussie !");
        return { ...data, user: normalized };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erreur de connexion.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [http]
  );

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, [checkAuth]);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: string
    ): Promise<LoginResponse> => {
      setLoading(true);
      setError(null);
      try {
        const data = (await http("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, name, role }),
        })) as LoginResponse;

        if (!data?.token || !data?.user) {
          throw new Error("Réponse invalide du serveur.");
        }

        localStorage.setItem("authToken", data.token);
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        toast.success("Inscription réussie !");
        return { ...data, user: normalized };
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Erreur lors de l'inscription.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [http]
  );

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, signup, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
