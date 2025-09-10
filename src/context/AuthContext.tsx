import * as React from "react"
import { apiClient, ApiError } from "@/api/apiClient" // chemin relatif (évite l'erreur TS2307)
import { Navigate } from "react-router-dom"

// --- Types ---
export interface User {
  id: string
  name?: string | null
  email: string
  roles: string[]
  role?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name?: string
  email: string
  password: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

// --- Context ---
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

// --- Helpers ---
function mapApiError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return (err.message as string) || "Requête invalide"
      case 401:
        return "Identifiants invalides ou session expirée"
      case 403:
        return "Accès refusé"
      case 404:
        return "Ressource introuvable"
      case 409:
        return (err.message as string) || "Cet utilisateur existe déjà"
      case 500:
        return "Erreur serveur, réessayez plus tard"
      default:
        return (err.message as string) || `Erreur inconnue (${err.status})`
    }
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Erreur réseau ou inattendue"
}

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Token helpers
  const getRefreshToken = () => localStorage.getItem("refreshToken")
  const saveTokens = (token: string, refreshToken?: string) => {
    localStorage.setItem("token", token)
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
  }
  const clearTokens = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
  }

  // --- Actions ---
  const logout = React.useCallback(async () => {
    try {
      setLoading(true)
      await apiClient.post<void>("/api/auth/logout", {})
    } catch (err: unknown) {
      console.error("AuthContext::logout error", err)
      setError(mapApiError(err))
    } finally {
      clearTokens()
      setUser(null)
      setLoading(false)
    }
  }, [])

  const refreshToken = React.useCallback(async () => {
    try {
      const rt = getRefreshToken()
      if (!rt) return
      const { data } = await apiClient.post<{ token: string }>("/api/auth/refresh", {
        refreshToken: rt,
      })
      saveTokens(data.token)
    } catch (err: unknown) {
      console.error("AuthContext::refresh error", err)
      await logout()
    }
  }, [logout])

  const refetch = React.useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get<{ user: User }>("/api/auth/me")
      setUser(data.user)
      setError(null)
    } catch (err: unknown) {
      console.error("AuthContext::refetch error", err)
      if (err instanceof ApiError && err.status === 401) {
        await refreshToken()
      }
      setUser(null)
      setError("Session expirée, veuillez vous reconnecter")
    } finally {
      setLoading(false)
    }
  }, [refreshToken])

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.post<{ token: string; user: User }>(
        "/api/auth/login",
        credentials
      )
      saveTokens(data.token)
      setUser(data.user)
    } catch (err: unknown) {
      console.error("AuthContext::login error", err)
      const msg = mapApiError(err)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = React.useCallback(
    async (data: SignupData) => {
      try {
        setLoading(true)
        setError(null)
        await apiClient.post<void>("/api/auth/signup", data)
        // login auto
        await login({ email: data.email, password: data.password })
      } catch (err: unknown) {
        console.error("AuthContext::signup error", err)
        const msg = mapApiError(err)
        setError(msg)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    [login]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  const value: AuthContextValue = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    refetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook ---
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

// --- Guard ---
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return <div className="p-6 text-center text-neutral-500">Chargement…</div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
export default AuthContext
