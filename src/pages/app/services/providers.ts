// src/pages/app/services/providers.ts
import axios from "axios";
import { ProviderStatus } from "@/types/providers";

// Mise à jour du statut du prestataire côté backend
export async function updateProviderStatus(status: ProviderStatus) {
  const res = await axios.patch("/api/providers/status", { status });
  return res.data;
}
