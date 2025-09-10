import { apiClient } from "@/api/apiClient";

// ──────────────────────────────
// Types partagés avec backend
// ──────────────────────────────
export type ProviderStatus = "READY" | "PAUSED" | "BUSY" | "OFFLINE";

export interface ProviderProfile {
  id: string;
  name: string;
  city?: string | null;
  description?: string | null;
  status: ProviderStatus;
  jobsCompleted: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderEarnings {
  today: number;
  week: number;
  month: number;
  currency: string;
}

export interface Mission {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface RankingEntry {
  providerId: string;
  name: string;
  avgRating: number;
  jobsCompleted: number;
  rankScore: number;
}

// ──────────────────────────────
// API REST (HTTP)
// ──────────────────────────────

/**
 * Récupère le profil provider connecté
 */
export async function fetchProviderProfile(): Promise<ProviderProfile> {
  const { data } = await apiClient.get<ProviderProfile>("/api/v1/providers/me");
  return data;
}

/**
 * Récupère le résumé des earnings
 * (calculés côté backend depuis walletAccount + walletTransaction Prisma)
 */
export async function fetchProviderEarnings(): Promise<ProviderEarnings> {
  const { data } = await apiClient.get<ProviderEarnings>("/api/v1/providers/earnings");
  return data;
}

/**
 * Liste les missions assignées au provider
 */
export async function fetchProviderMissions(): Promise<Mission[]> {
  const { data } = await apiClient.get<Mission[]>("/api/v1/providers/missions");
  return data;
}

/**
 * Classement providers (ranking global)
 */
export async function fetchProviderRanking(): Promise<RankingEntry[]> {
  const { data } = await apiClient.get<RankingEntry[]>("/api/v1/providers/ranked");
  return data;
}
