import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";
import { getBalance } from "../services/walletService.js";

const router = Router();

function getUserId(req) { return req.userId || req.user?.id }

// POST /api/payements/withdraw → crée une demande de retrait (PENDING)
router.post(
  "/withdraw",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER"),
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const { amount, method, destination, note } = req.body || {};
      const amt = Math.floor(Number(amount));
      if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ error: "Montant invalide" });
      }

      const balance = await getBalance(userId);
      if (amt > balance) return res.status(400).json({ error: "Solde insuffisant" });

      const wr = await prisma.withdrawRequest.create({
        data: { userId, amount: amt, method, destination, note, status: "PENDING" },
      });
      res.status(201).json({ code: "WITHDRAW_REQUESTED", data: wr });
    } catch (e) { next(e) }
  }
);

// GET /api/payements/withdraws → liste des retraits de l'utilisateur
router.get(
  "/withdraws",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated" });
      const items = await prisma.withdrawRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      res.json({ data: items });
    } catch (e) { next(e) }
  }
);

export default router;

