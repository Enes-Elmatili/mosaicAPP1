// backend/routes/wallet.js
import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getBalance,
  listTxs,
  credit,
  debit,
} from "../services/walletService.js";

const router = Router();

// Helper pour récupérer l'ID user de façon sûre
function getUserId(req) {
  return req.userId || req.user?.id;
}

// GET /api/wallet → balance du user connecté
router.get(
  "/",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const balance = await getBalance(userId);
      res.json({ balance }); 
    } catch (e) {
      next(e);
    }
  }
);

// GET /api/wallet/txs?limit=50
router.get(
  "/txs",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const limit = Number(req.query.limit || 50);
      const txs = await listTxs(userId, limit);
      res.json(txs);
    } catch (e) {
      next(e);
    }
  }
);

// POST /api/wallet/credit { amount, reference, userId? }
// réservé ADMIN : peut créditer son propre wallet OU un user cible
router.post(
  "/credit",
  authenticateFlexible,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const { amount, reference, userId: targetId } = req.body;
      const userId = targetId || getUserId(req); // ✅ si ADMIN précise un userId, on l'utilise
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const tx = await credit(userId, Number(amount), reference);
      res.status(201).json(tx);
    } catch (e) {
      next(e);
    }
  }
);

// POST /api/wallet/debit { amount, reference }
router.post(
  "/debit",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER"),
  async (req, res, next) => {
    try {
      const { amount, reference } = req.body;
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const tx = await debit(userId, Number(amount), reference);
      res.status(201).json(tx);
    } catch (e) {
      next(e);
    }
  }
);

export default router;