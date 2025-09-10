// backend/sockets/index.js
import { Server } from "socket.io";
import prisma from "../db/prisma.js";

/**
 * @typedef {"READY" | "PAUSED" | "BUSY" | "OFFLINE"} ProviderStatus
 */

// Map providerId → socketId
export const providerSockets = new Map();
export let io = null;

// Permet d'attacher un serveur Socket.IO existant (utilisé par server.js)
export function attachIo(instance) {
  io = instance;
}

// Normalisation des statuts
function normalizeIn(status) {
  if (status === "ON_MISSION") return "BUSY";
  if (["READY", "PAUSED", "BUSY", "OFFLINE"].includes(status)) {
    return /** @type {ProviderStatus} */ (status);
  }
  return "OFFLINE";
}

// Met à jour le statut et notifie
async function safeSetStatus(providerId, desired) {
  if (!providerId || !io) return;
  const normalized = normalizeIn(desired);

  try {
    await prisma.provider.update({
      where: { id: providerId },
      data: { status: normalized },
    });

    io.emit("provider:status_update", { providerId, status: normalized });
  } catch (err) {
    console.error(
      `[SOCKET] Failed to update provider ${providerId} → ${normalized}:`,
      err
    );
  }
}

// Initialise Socket.IO
export function initSockets(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by Socket.IO CORS: " + origin));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] ${socket.id} connected`);

    // 👉 provider:join
    socket.on("provider:join", async ({ providerId }) => {
      if (!providerId) return;
      providerSockets.set(providerId, socket.id);
      console.log(`[PROVIDER] ${providerId} joined via socket ${socket.id}`);
      await safeSetStatus(providerId, "READY");
    });

    // 👉 provider:set_status
    socket.on("provider:set_status", async ({ providerId, status }) => {
      if (!providerId || !status) return;
      await safeSetStatus(providerId, status);
    });

    // 👉 new_request (ciblé à un provider)
    socket.on("new_request", async ({ requestId, providerId }) => {
      if (!providerId || !requestId) return;
      const targetSocket = providerSockets.get(providerId);
      if (targetSocket) {
        io.to(targetSocket).emit("new_request", { requestId });
        console.log(`[REQUEST] ${requestId} envoyé à ${providerId}`);
      } else {
        console.warn(`[REQUEST] Provider ${providerId} non connecté`);
      }
    });

    // 👉 messages (chat basique)
    socket.on("message:send", async ({ from, to, content }) => {
      if (!from || !to || !content) return;
      console.log(`[MESSAGE] ${from} → ${to}: ${content}`);

      try {
        await prisma.message.create({
          data: { from, to, content },
        });
      } catch (err) {
        console.warn("[WARN] Impossible de sauvegarder le message:", err.message);
      }

      const targetSocket = providerSockets.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("message:receive", { from, content });
      }
    });

    // 👉 wallet:credit
    socket.on("wallet:credit", async ({ providerId, amount }) => {
      if (!providerId || !amount) return;
      console.log(`[WALLET] credit ${amount} → ${providerId}`);

      try {
        const account = await prisma.walletAccount.update({
          where: { userId: providerId },
          data: { balance: { increment: amount } },
        });

        await prisma.walletTransaction.create({
          data: {
            accountId: account.id,
            amount,
            type: "CREDIT",
            balanceBefore: account.balance - amount,
            balanceAfter: account.balance,
          },
        });

        io.to(providerSockets.get(providerId)).emit("wallet:update", {
          balance: account.balance,
        });
      } catch (err) {
        console.error("[ERROR] wallet:credit", err.message);
        io.to(providerSockets.get(providerId)).emit("wallet:error", {
          message: "Erreur lors du crédit",
        });
      }
    });

    // 👉 wallet:debit (avec blocage si solde insuffisant)
    socket.on("wallet:debit", async ({ providerId, amount }) => {
      if (!providerId || !amount) return;
      console.log(`[WALLET] debit ${amount} → ${providerId}`);

      try {
        const account = await prisma.walletAccount.findUnique({
          where: { userId: providerId },
        });

        if (!account) {
          console.error(`[ERROR] Wallet introuvable pour userId=${providerId}`);
          io.to(providerSockets.get(providerId)).emit("wallet:error", {
            message: "Wallet introuvable",
          });
          return;
        }

        if (account.balance < amount) {
          console.warn(
            `[WARN] Solde insuffisant: ${account.balance} < ${amount} (userId=${providerId})`
          );
          io.to(providerSockets.get(providerId)).emit("wallet:error", {
            message: "Solde insuffisant",
            balance: account.balance,
          });
          return;
        }

        const updated = await prisma.walletAccount.update({
          where: { userId: providerId },
          data: { balance: { decrement: amount } },
        });

        await prisma.walletTransaction.create({
          data: {
            accountId: updated.id,
            amount,
            type: "DEBIT",
            balanceBefore: account.balance,
            balanceAfter: updated.balance,
          },
        });

        io.to(providerSockets.get(providerId)).emit("wallet:update", {
          balance: updated.balance,
        });
      } catch (err) {
        console.error("[ERROR] wallet:debit", err.message);
        io.to(providerSockets.get(providerId)).emit("wallet:error", {
          message: "Erreur lors du débit",
        });
      }
    });

    // 👉 disconnect
    socket.on("disconnect", async () => {
      const providerId = [...providerSockets.entries()].find(
        ([, sid]) => sid === socket.id
      )?.[0];

      if (!providerId) return;

      providerSockets.delete(providerId);
      await safeSetStatus(providerId, "OFFLINE");
      console.log(`[SOCKET] Provider ${providerId} disconnected`);
    });
  });

  return io;
}
