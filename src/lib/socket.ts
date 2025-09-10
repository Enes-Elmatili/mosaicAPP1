export function getSocketUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_WS_URL || (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";
  // Use HTTP(S) base for socket.io; the client handles the WebSocket upgrade internally.
  return raw as string;
}

export function getApiBase(): string {
  const raw = (import.meta as any)?.env?.VITE_API_URL || (import.meta as any)?.env?.VITE_WS_URL || "http://localhost:3000";
  return raw as string;
}
