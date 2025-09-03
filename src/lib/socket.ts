// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Retourne une instance unique de socket.io côté client
 */
export default function getSocket(): Socket {
  if (!socket) {
    socket = io("/", {
      path: "/socket.io",
      transports: ["websocket"], // 🔥 évite le polling inutile
      withCredentials: true, // envoie les cookies/session
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Déconnecté de Socket.IO:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion Socket.IO:", err.message);
    });
  }
  return socket;
}

/**
 * Permet de fermer proprement la connexion
 */
export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
