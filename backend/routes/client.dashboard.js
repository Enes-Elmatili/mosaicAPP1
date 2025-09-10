import express from "express";
import prisma from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js"; // ✅ importer le strict

const router = express.Router();

/**
 * GET /api/client/dashboard
 * Retourne les infos agrégées du tableau de bord du client
 */
router.get("/dashboard", authenticate, async (req, res, next) => {
  try {
    const userId = req.userId; // ✅ normalisé par le middleware

    // Profil de l'utilisateur (+ rôles via relations)
    const meRaw = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
    });

    // Normalisation des rôles → roles: string[] et role: string (principal)
    const roles = (meRaw?.userRoles || [])
      .map((ur) => ur.role?.name)
      .filter(Boolean);
    const primaryRole = roles[0] || "CLIENT";

    // Stats
    const activeRequests = await prisma.request.count({
      where: { clientId: userId, status: { in: ["PUBLISHED", "ONGOING", "ACCEPTED"] } },
    });

    // Payments count: via wallet transactions or provider payments
    const paymentsCount = await prisma.walletTransaction.count({
      where: { account: { userId } },
    });

    // Wallet + last transactions
    const wallet = await prisma.walletAccount.findUnique({
      where: { userId },
      include: { txs: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    // Dernières requêtes
    const requestsRaw = await prisma.request.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, serviceType: true, status: true, createdAt: true },
    });
    const requests = requestsRaw.map((r) => ({
      id: r.id,
      title: r.serviceType,
      status: r.status,
      createdAt: r.createdAt,
    }));

    // Derniers paiements (si l'utilisateur est provider)
    const payments = await prisma.payment.findMany({
      where: { provider: { userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, amount: true, status: true, createdAt: true },
    });

    // Notifications (pas de modèle Notification dans le schéma → retourne un tableau vide)
    const notifications = [];

    // Messages
    const messagesRaw = await prisma.message.findMany({
      where: { to: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, from: true, content: true, createdAt: true },
    });
    const messages = messagesRaw.map((m) => ({
      id: m.id,
      senderId: m.from,
      text: m.content,
      createdAt: m.createdAt,
    }));

    const payload = {
      me: {
        id: meRaw?.id || "",
        email: meRaw?.email || "",
        name: meRaw?.name || "",
        role: primaryRole,
        roles,
      },
      stats: { activeRequests, paymentsCount },
      wallet: wallet
        ? {
            balance: wallet.balance,
            transactions: wallet.txs.map((tx) => ({
              id: tx.id,
              amount: tx.amount,
              type: tx.type,
              createdAt: tx.createdAt,
            })),
          }
        : { balance: 0, transactions: [] },
      requests,
      payments,
      notifications,
      messages,
    };

    // 🔔 Temps réel: pousser un résumé au client connecté (room=userId) si Socket.io est disponible
    try {
      req.io?.to?.(userId)?.emit?.("dashboard:update", {
        stats: payload.stats,
        notifications: payload.notifications?.length || 0,
        requests: payload.requests?.length || 0,
      });
    } catch {}

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
