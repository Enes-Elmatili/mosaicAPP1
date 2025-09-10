import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ProviderStatus } from "@/services/providerService";

interface WalletUpdate {
  balance: number;
}

interface WalletError {
  message: string;
  balance?: number;
}

interface LocationUpdate {
  providerId: string;
  lat: number;
  lng: number;
  ts: number;
}

export function useProviderSocket(providerId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ProviderStatus>("OFFLINE");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(s);

    // join dès connexion
    s.on("connect", () => {
      console.log("[socket] connected:", s.id);
      s.emit("provider:join", { providerId });
    });

    // status update
    s.on("provider:status_update", ({ providerId: pid, status }) => {
      if (pid === providerId) {
        setStatus(status as ProviderStatus);
      }
    });

    // wallet update
    s.on("wallet:update", (data: WalletUpdate) => {
      setWalletBalance(data.balance);
    });

    // wallet error
    s.on("wallet:error", (data: WalletError) => {
      setError(data.message);
    });

    // location update (si besoin pour monitoring)
    s.on("provider-location-update", (data: LocationUpdate) => {
      if (data.providerId === providerId) {
        setLocation(data);
      }
    });

    s.on("disconnect", () => {
      console.log("[socket] disconnected");
      setStatus("OFFLINE");
    });

    return () => {
      s.disconnect();
    };
  }, [providerId]);

  // helpers
  const setProviderStatus = (newStatus: ProviderStatus) => {
    socket?.emit("provider:set_status", { providerId, status: newStatus });
  };

  const creditWallet = (amount: number) => {
    socket?.emit("wallet:credit", { providerId, amount });
  };

  const debitWallet = (amount: number) => {
    socket?.emit("wallet:debit", { providerId, amount });
  };

  const sendLocation = (lat: number, lng: number) => {
    socket?.emit("provider-location", { providerId, lat, lng });
  };

  return {
    socket,
    status,
    walletBalance,
    location,
    error,
    setProviderStatus,
    creditWallet,
    debitWallet,
    sendLocation,
  };
}
