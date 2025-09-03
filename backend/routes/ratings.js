import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";
import { z } from "zod";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";

const router = Router();

// Schemas Zod
const ReviewCreateSchema = z.object({
  providerId: z.string().uuid(),
  requestId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

const ProviderIdParam = z.object({ providerId: z.string().uuid() });

const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ───────────────────────────────────────────────
// POST /api/ratings → un client note un provider
// ───────────────────────────────────────────────
router.post(
  "/",
  authenticateFlexible,
  requireRole("CLIENT"),
  validateBody(ReviewCreateSchema),
  async (req, res, next) => {
    try {
      const { providerId, requestId, rating, comment } = req.body;
      const clientId = req.user.id;

      // Vérifie la request
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: { id: true, clientId: true, providerId: true, status: true },
      });

      if (!request) return res.status(404).json({ error: "Request not found" });
      if (request.clientId !== clientId)
        return res.status(403).json({ error: "Forbidden: not your request" });
      if (request.providerId !== providerId)
        return res.status(400).json({ error: "Provider mismatch" });
      if (request.status !== "DONE")
        return res.status(400).json({ error: "Request not completed yet" });

      // Vérifie si déjà notée (grâce à @@unique [requestId, clientId])
      const existing = await prisma.review.findUnique({
        where: { requestId_clientId: { requestId, clientId } },
      });
      if (existing) return res.status(409).json({ error: "Already reviewed" });

      // Crée la review + MAJ provider stats
      const review = await prisma.$transaction(async (tx) => {
        const newReview = await tx.review.create({
          data: { providerId, requestId, rating, comment: comment || null, clientId },
        });

        const agg = await tx.review.aggregate({
          where: { providerId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.provider.update({
          where: { id: providerId },
          data: {
            avgRating: agg._avg.rating ?? 0,
            totalRatings: agg._count.rating,
          },
        });

        return newReview;
      });

      res.status(201).json({ success: true, data: review });
    } catch (e) {
      console.error("[POST /api/ratings]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// GET /api/ratings/:providerId → liste reviews
// ───────────────────────────────────────────────
router.get(
  "/:providerId",
  authenticateFlexible,
  requireRole("ADMIN", "CLIENT", "PROVIDER"),
  validateParams(ProviderIdParam),
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const { providerId } = req.params;
      const page = req.query.page ?? 1;
      const limit = Math.min(req.query.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { providerId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: { client: { select: { id: true, email: true, name: true } } },
        }),
        prisma.review.count({ where: { providerId } }),
      ]);

      res.json({ success: true, page, limit, total, data: reviews });
    } catch (e) {
      console.error("[GET /api/ratings/:providerId]", e);
      next(e);
    }
  }
);

export default router;
