import { create } from "zustand";

type Role = "tenant" | "owner" | "provider";
export type User = { id: string; email: string; role: Role } | null;

type AuthState = {
  user: User;
  init: () => void;
  loginAsTenant: (email: string) => void;
  logout: () => void;
};

const KEY = "mosaic_auth";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  init: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set({ user: JSON.parse(raw) });
    } catch {}
  },
  loginAsTenant: (email) => {
    const user = { id: "demo-tenant-1", email, role: "tenant" as const };
    localStorage.setItem(KEY, JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem(KEY);
    set({ user: null });
  },
}));
