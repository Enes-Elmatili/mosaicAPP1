import { apiClient } from "@/api/apiClient";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO 8601
}

interface RequestResponse {
  id: string;
  title?: string;
  serviceType?: string;
  description?: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  items: T[];
}

interface FetchActivitiesOptions {
  role?: "CLIENT" | "PROVIDER" | "ADMIN";
  clientId?: string;
  providerId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/**
 * Récupère la liste des activités (requests) depuis le backend
 */
export async function fetchActivities(
  options: FetchActivitiesOptions = {}
): Promise<ActivityItem[]> {
  const {
    role,
    clientId,
    providerId,
    status,
    from,
    to,
    page = 1,
    limit = 20,
  } = options;

  const baseUrl =
    role === "CLIENT" ? "/api/v1/client/requests" : "/api/v1/requests";

  const params = new URLSearchParams();
  if (clientId) params.append("clientId", clientId);
  if (providerId) params.append("providerId", providerId);
  if (status) params.append("status", status);
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const url = `${baseUrl}?${params.toString()}`;
  const res = await apiClient.get(url);

  if (!res.ok) {
    throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
  }

  const json: PaginatedResponse<RequestResponse> | RequestResponse[] =
    await res.json();

  const rawItems: RequestResponse[] = Array.isArray(json)
    ? json
    : json.items;

  return rawItems.map((r): ActivityItem => ({
    id: r.id,
    title: r.title ?? r.serviceType ?? "Demande",
    description: r.description ?? "",
    createdAt: r.createdAt,
  }));
}
