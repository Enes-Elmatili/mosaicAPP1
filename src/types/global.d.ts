// Déclaration Prisma
declare module "../backend/db/prisma.js" {
    import { PrismaClient } from "@prisma/client";
    export const prisma: PrismaClient;
  }
  
  // Déclaration serveur (socket.io exporté depuis backend/server.js)
  declare module "../backend/server.js" {
    import { Server as SocketIOServer } from "socket.io";
    export const io: SocketIOServer;
  }
  