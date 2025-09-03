import api, { apiBlob } from "../../../lib/api";

export type ServiceType =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "general"
  | "other";

export type Priority = "low" | "medium" | "high";
export type PriorityEnum = "LOW" | "MEDIUM" | "HIGH";

/* ---------------- Types ---------------- */

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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

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

/* ---------------- Helpers ---------------- */
function qs(params: Record<string, unknown> = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    s.set(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

/* ---------------- API ---------------- */

export async function listRequests(params: {
  status?: string;
  propertyId?: string | number;
  serviceType?: ServiceType;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  order?: "asc" | "desc";
}) {
  const data = await api.get(`/requests${qs(params)}`);
  return data as Paginated<MaintenanceRequest>;
}

export async function getRequest(id: number) {
  const data = await api.get(`/requests/${id}`);
  return data as MaintenanceRequest;
}

export async function createRequest(input: CreateRequestInput) {
  const data = await api.post(`/requests`, input);
  return data as MaintenanceRequest;
}

export async function updateRequest(id: number, input: UpdateRequestInput) {
  const data = await api.patch(`/requests/${id}`, input);
  return data as MaintenanceRequest;
}

export async function deleteRequest(id: number) {
  await api.delete(`/requests/${id}`);
}

/* ---------------- Photos ---------------- */

export async function uploadPhoto(id: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  const data = await api.post(`/requests/${id}/photos`, form);
  return data as {
    url: string;
    width: number;
    height: number;
    size: number;
    mime: string;
  };
}

export async function deletePhoto(id: number, filename: string) {
  await api.delete(`/requests/${id}/photos/${encodeURIComponent(filename)}`);
}

/* ---------------- Status History ---------------- */

export interface StatusHistoryItem {
  id: number;
  requestId: number;
  status: string;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
}

export async function getStatusHistory(id: number) {
  const data = await api.get(`/requests/${id}/status-history`);
  return data as StatusHistoryItem[];
}

export async function exportStatusHistoryPdf(id: number) {
  const blob = await apiBlob(`/requests/${id}/status-history/export/pdf`, {
    headers: { Accept: "application/pdf" },
  });
  return blob as Blob;
}

export async function exportStatusHistoryCsv(id: number) {
  const blob = await apiBlob(`/requests/${id}/status-history/export/csv`, {
    headers: { Accept: "text/csv;charset=utf-8" },
  });
  return blob as Blob;
}

/* ---------------- Error Helper ---------------- */

export function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
