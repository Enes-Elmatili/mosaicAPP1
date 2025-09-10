    import { apiClient } from "@/api/apiClient";
import { MeResponse } from "@/services/meService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: MeResponse;
}

/**
 * Authentifie l’utilisateur
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/login", credentials);
  localStorage.setItem("token", data.token);
  return data;
}

/**
 * Déconnecte l’utilisateur
 */
export async function logout(): Promise<void> {
  await apiClient.post<void>("/api/v1/auth/logout", {});
  localStorage.removeItem("token");
}
