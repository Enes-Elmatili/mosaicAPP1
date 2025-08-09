// Ensure API base defaults to /api and allow override
const RAW_API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const API_URL = RAW_API_URL.endsWith('/api') || RAW_API_URL.includes('/api/')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const masterKey = typeof localStorage !== 'undefined' ? localStorage.getItem('mosaic_master_key') : null;
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(masterKey ? { 'x-master-key': masterKey } : {}),
    },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return (await res.json()) as T;
}
