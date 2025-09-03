/* Utilitaires API pour le frontend */

export const API_BASE =
  import.meta.env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:3001/api";

export function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
