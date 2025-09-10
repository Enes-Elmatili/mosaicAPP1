import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import { router } from "@/routes"; // ✅ importer ici
import "./index.css";

// ⚡ créer une instance du client React Query
const queryClient = new QueryClient();

// Register SW uniquement si activé
if ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ENABLE_PWA === "true") {
  const mod = "virtual:pwa-register";
  import(/* @vite-ignore */ mod)
    .then(({ registerSW }: { registerSW: (opts?: { onNeedRefresh?: () => void }) => () => void }) => {
      const updateSW = registerSW({
        onNeedRefresh() {
          toast(
            (t) => (
              <span>
                Nouvelle version dispo&nbsp;
                <button
                  onClick={() => {
                    updateSW();
                    toast.dismiss(t.id);
                  }}
                  className="underline"
                >
                  Rechargez
                </button>
              </span>
            ),
            { duration: Infinity }
          );
        },
      });
    })
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} /> {/* ✅ utilisation directe */}
      </AuthProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);