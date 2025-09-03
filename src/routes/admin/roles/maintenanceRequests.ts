export type ServiceType =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "general"
  | "other";

export type Priority = "low" | "medium" | "high";
export type PriorityEnum = "LOW" | "MEDIUM" | "HIGH";

/**
 * Représente une demande de maintenance stockée en base (alignée avec Prisma).
 */
export interface MaintenanceRequest {
  id: number;
  clientId: string;
  propertyId: string | number | null;
  serviceType: ServiceType;
  description: string;
  status?: string | null;
  priority?: PriorityEnum | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  photos: string[];
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  geohash?: string | null;
  providerId?: string | null;
  providerDistanceKm?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination générique (utile pour liste de demandes).
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Payload utilisé pour créer une demande.
 * Correspond au body attendu par POST /api/requests
 */
export interface CreateRequestInput {
  propertyId?: string | number | null;
  serviceType: ServiceType;
  description: string;
  priority?: Priority;
  categoryId?: string;
  subcategoryId?: string;
  photos?: string[];
  address?: string;
  lat?: number;
  lng?: number;
}

/**
 * Payload utilisé pour mettre à jour une demande existante.
 * Correspond au body attendu par PATCH /api/requests/:id
 */
export interface UpdateRequestInput {
  propertyId?: string | number | null;
  serviceType?: ServiceType;
  description?: string;
  status?: string;
  priority?: Priority;
  categoryId?: string;
  subcategoryId?: string;
  photos?: string[];
  address?: string;
  lat?: number;
  lng?: number;
}

/**
 * Historique des statuts (lié à chaque Request).
 */
export interface StatusHistoryItem {
  id: number;
  requestId: number;
  status: string;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
}
