const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Client API robuste basé sur fetch, avec gestion JWT + erreurs normalisées
 */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Helper: normalise HeadersInit -> Record<string, string>
function normalizeHeaders(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) {
    const record: Record<string, string> = {};
    h.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h);
  }
  return h;
}

export type ApiResponse<T> = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  json: () => Promise<T>;
  text: () => Promise<string>;
  data: T;
};

let apiErrorHandler: ((err: ApiError) => void) | null = null;

export function setApiErrorHandler(handler: (err: ApiError) => void) {
  apiErrorHandler = handler;
}

export const onError = setApiErrorHandler;

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(options.headers),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${url}`, {
      method,
      ...options,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr: any) {
    const err = new ApiError(0, "Network error", networkErr)
    try { apiErrorHandler?.(err) } catch {}
    throw err
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new ApiError(res.status, (data as any)?.message ?? res.statusText, data);
    try {
      apiErrorHandler?.(err);
    } catch {}
    throw err;
  }

  // Build a minimal Response-like object with direct data access
  const apiRes: ApiResponse<T> = {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    url: res.url,
    json: async () => data as T,
    text: async () => text,
    data: data as T,
  };

  return apiRes;
}

export const apiClient = {
  get: <T>(url: string, options?: RequestInit) => request<T>("GET", url, undefined, options),
  post: <T>(url: string, body: unknown, options?: RequestInit) => request<T>("POST", url, body, options),
  put: <T>(url: string, body: unknown, options?: RequestInit) => request<T>("PUT", url, body, options),
  patch: <T>(url: string, body?: unknown, options?: RequestInit) => request<T>("PATCH", url, body, options),
  delete: <T>(url: string, options?: RequestInit) => request<T>("DELETE", url, undefined, options),
};

export const mapApiError = (err: unknown): string => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
    return (err as any).message;
  }
  if (err && typeof err === "object" && "error" in err && typeof (err as any).error === "string") {
    return (err as any).error;
  }
  return "Erreur réseau ou inattendue";
};
