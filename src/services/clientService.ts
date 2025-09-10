import { apiClient } from "@/api/apiClient";

export interface ClientRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

/**
 * Récupère les demandes d’un client
 */
export async function fetchClientRequests(): Promise<ClientRequest[]> {
  const { data } = await apiClient.get<ClientRequest[]>("/api/v1/client/requests");
  return data;
}
