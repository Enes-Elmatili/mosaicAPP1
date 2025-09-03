import { createContext, useContext } from "react";
import type { AuthContextValue } from "./AuthContext"; // ✅ garde la synchro exacte

// Contexte typé
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
