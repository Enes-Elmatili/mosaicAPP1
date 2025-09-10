import { apiClient } from "@/api/apiClient";

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "PROVIDER" | "ADMIN";
}

/**
 * Récupère le profil utilisateur connecté
 */
export async function fetchMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>("/api/v1/me");
  return data;
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout(): Promise<void> {
  await apiClient.post<void>("/api/v1/auth/logout", {});
  localStorage.removeItem("token");
}
