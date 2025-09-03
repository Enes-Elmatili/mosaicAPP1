// src/types/provider.ts

// 🔹 Enum partagé entre backend & frontend
export enum ProviderStatus {
  READY = "READY",
  PAUSED = "PAUSED",
  OFFLINE = "OFFLINE",
}

// 🔹 Interface pour les providers
export interface Provider {
  id: string;
  name: string;
  email: string;
  status: ProviderStatus;
}
