// src/hooks/useProviderStatus.ts
import { useState, useEffect } from "react";
import getSocket from "@/lib/socket";
import { ProviderStatus } from "@/types/providers";
import { updateProviderStatus } from "@/pages/app/services/providers";

export function useProviderStatus() {
  const [status, setStatusState] = useState<ProviderStatus>(ProviderStatus.OFFLINE);

  useEffect(() => {
    const socket = getSocket();

    // 🔹 quand on reçoit un changement depuis le backend
    socket.on("provider-status-changed", (newStatus: ProviderStatus) => {
      setStatusState(newStatus);
    });

    return () => {
      socket.off("provider-status-changed");
    };
  }, []);

  const setStatus = async (newStatus: ProviderStatus) => {
    try {
      // 🔹 appel API REST
      await updateProviderStatus(newStatus);

      // 🔹 mise à jour locale
      setStatusState(newStatus);

      // 🔹 notification socket (si tu veux que ça parte direct)
      const socket = getSocket();
      socket.emit("provider-status-changed", newStatus);
    } catch (err) {
      console.error("Erreur maj statut provider:", err);
    }
  };

  return { status, setStatus };
}
