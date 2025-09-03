// src/types/express.d.ts
import type { Server as SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    export interface Request {
      /**
       * Objet utilisateur injecté par authenticateFlexible
       * - null si pas authentifié
       */
      user?: {
        id?: string;
        sub?: string;
        role?: string;
        via?: string;
        [key: string]: any;
      } | null;

      /** Identifiant unique extrait du JWT ou master-key */
      userId?: string;

      /** Instance socket.io (injectée via app.set("io", io)) */
      io?: SocketIOServer;
    }
  }
}

export {};
