/**
 * services/requests.ts
 * Fournit les appels HTTP pour gérer les demandes de maintenance.
 */
import { api } from '../lib/api';
import type { MaintenanceRequest, CreateRequestInput } from '../types/request';

/**
 * Récupère une demande par son identifiant.
 */
export async function getRequest(id: number): Promise<MaintenanceRequest> {
  return api<MaintenanceRequest>(`/requests/${id}`);
}

/**
 * Met à jour le statut d'une demande existante.
 */
export async function updateRequestStatus(
  id: number,
  status: MaintenanceRequest['status'],
): Promise<{ request: MaintenanceRequest; history: any[] }> {
  return api(`/requests/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

/**
 * Crée une nouvelle demande de maintenance.
 */
export async function createRequest(
  input: CreateRequestInput,
): Promise<MaintenanceRequest> {
  return api<MaintenanceRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function uploadPhotos(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/uploads`, {
    method: 'POST',
    body: form,
    headers: (() => {
      const h: Record<string, string> = {};
      const masterKey = typeof localStorage !== 'undefined' ? localStorage.getItem('mosaic_master_key') : null;
      if (masterKey) h['x-master-key'] = masterKey;
      return h;
    })(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.urls as string[];
}
