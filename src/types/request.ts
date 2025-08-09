// src/types/request.ts
export type ServiceType = 'plumbing' | 'electrical' | 'hvac' | 'general' | 'other';
export type Priority = 'low' | 'medium' | 'high';

export type MaintenanceRequest = {
  id: number;
  clientId: string;
  propertyId: string;
  serviceType: ServiceType;
  description: string;
  categoryId?: string;
  subcategoryId?: string;
  photos?: string[];
  priority?: Priority;
  status: string;
  providerId?: string;
  providerName?: string;
  providerDistanceKm?: number;
  contractUrl?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type CreateRequestInput = {
  propertyId: string | number;
  serviceType: ServiceType;
  categoryId?: string;
  subcategoryId?: string;
  description: string;
  photos?: string[];
  priority?: Priority;
};
