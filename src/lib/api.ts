// src/lib/api.ts

type ApiInit = RequestInit & {
  headers?: HeadersInit;
  as?: 'json' | 'text' | 'blob' | 'arrayBuffer';
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";
const API_DEBUG = ((import.meta as any).env?.VITE_API_DEBUG ?? "false") === "true";

function join(base: string, p: string) {
  const b = (base || "").replace(/\/+$/, "");
  const q = (p || "").replace(/^\/+/, "");
  return b ? `${b}/${q}` : `/${q}`;
}

function buildHeaders(init: ApiInit) {
  const h = new Headers();
  h.set("Accept", "application/json");
  const incoming = new Headers(init.headers || {});
  if (!(init.body instanceof FormData) && !incoming.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  incoming.forEach((v, k) => h.set(k, v));
  return h;
}

export async function apiFetch(path: string, init: ApiInit = {}) {
  const url = join(API_BASE, path);

  // Évite de passer "as" à fetch()
  const { as: responseAs, ...rest } = init;

  const res = await fetch(url, {
    ...rest,
    headers: buildHeaders(init),
    credentials: "include",
  }).catch((e) => {
    if (API_DEBUG) console.error("[apiFetch] Network error", { url, e });
    throw new Error(`Network error while calling ${url}: ${e?.message || e}`);
  });

  if (!res.ok) {
    let payload: any;
    const ct = res.headers.get("content-type") || "";
    try {
      payload = ct.includes("application/json") ? await res.json() : await res.text();
    } catch {}
    if (API_DEBUG) console.error("[apiFetch] HTTP error", { url, status: res.status, payload });
    const msg = payload?.error
      ? `${res.status} ${res.statusText} — ${payload.error}`
      : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return null;

  // Décodage explicite si demandé
  if (responseAs === "blob") return res.blob();
  if (responseAs === "arrayBuffer") return res.arrayBuffer();
  if (responseAs === "text") return res.text();

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Helpers pratiques pour binaires
export const apiBlob = (path: string, init: ApiInit = {}) =>
  apiFetch(path, { ...init, method: init.method ?? "GET", as: "blob" });

export const apiArrayBuffer = (path: string, init: ApiInit = {}) =>
  apiFetch(path, { ...init, method: init.method ?? "GET", as: "arrayBuffer" });

// Raccourci GET (compat)
export const apiGet = (path: string, init: ApiInit = {}) =>
  apiFetch(path, { ...init, method: "GET" });

// Signature typée pour l'objet-fonction "api"
interface ApiCallable {
  (path: string, init?: ApiInit): Promise<any>;
  get(path: string, init?: ApiInit): Promise<any>;
  post(path: string, body?: any, init?: ApiInit): Promise<any>;
  put(path: string, body?: any, init?: ApiInit): Promise<any>;
  patch(path: string, body?: any, init?: ApiInit): Promise<any>;
  delete(path: string, init?: ApiInit): Promise<any>;
}

// Implémentation + méthodes
const apiImpl = (async (path: string, init: ApiInit = {}) => apiFetch(path, init)) as ApiCallable;

apiImpl.get = (path: string, init: ApiInit = {}) =>
  apiFetch(path, { ...init, method: "GET" });

apiImpl.post = (path: string, body?: any, init: ApiInit = {}) =>
  apiFetch(path, {
    ...init,
    method: "POST",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

apiImpl.put = (path: string, body?: any, init: ApiInit = {}) =>
  apiFetch(path, {
    ...init,
    method: "PUT",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

apiImpl.patch = (path: string, body?: any, init: ApiInit = {}) =>
  apiFetch(path, {
    ...init,
    method: "PATCH",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

apiImpl.delete = (path: string, init: ApiInit = {}) =>
  apiFetch(path, { ...init, method: "DELETE" });

// Exports
export { apiImpl as api };
export default apiImpl;
