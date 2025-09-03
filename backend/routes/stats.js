// backend/routes/stats.js
import express from "express";
import { z } from "zod";
import { validateQuery } from "../middleware/validate.js";
import { authenticateFlexible } from "../middleware/authenticateFlexible.js";
import statsService from "../services/stats.js";
import { HttpError } from "../middleware/httpError.js";
import { prisma } from "../db/prisma.js"; // ✅ importer prisma

const router = express.Router();

const sinceSchema = z.object({
  since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD")
    .optional(),
});

/**
 * GET /api/stats
 * → Résumé global simple (ADMIN uniquement)
 */
router.get("/", authenticateFlexible, async (req, res, next) => {
  try {
    const roles = req.user?.roles || [];
    if (!roles.includes("ADMIN")) {
      return next(new HttpError(403, "Forbidden"));
    }

    const [users, providers, requests, payments] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.request.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    res.json({
      users,
      providers,
      requests,
      totalPayments: payments._sum.amount || 0,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/stats/overview
 * → Statistiques globales détaillées (ADMIN uniquement)
 */
router.get(
  "/overview",
  authenticateFlexible,
  validateQuery(sinceSchema),
  async (req, res, next) => {
    try {
      const roles = req.user?.roles || [];
      if (!roles.includes("ADMIN")) {
        return next(new HttpError(403, "Forbidden"));
      }

      const { since } = req.query;
      const data = await statsService.getOverview(req.app.get("prisma"), since);
      res.json(data);
    } catch (e) {
      console.error("[stats/overview]", e);
      next(e);
    }
  }
);

export default router;
