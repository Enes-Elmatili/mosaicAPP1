// backend/routes/notifications.js
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { z } from "zod";
import { validateParams, validateQuery } from "../middleware/validate.js";

const router = Router();

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const IdParam = z.object({ id: z.string().uuid() });
const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ───────────────────────────────────────────────
// GET /api/notifications → liste paginée
// ───────────────────────────────────────────────
router.get(
  "/",
  authenticateFlexible,
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthenticated" });
      }

      const page = req.query.page ?? 1;
      const limit = Math.min(req.query.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      if (!prisma?.notification?.findMany) {
        return res.json({ success: true, page, total: 0, notifications: [] });
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      res.json({ success: true, page, limit, total, notifications });
    } catch (error) {
      console.error("[GET /api/notifications]", error);
      next(error);
    }
  }
);

// ───────────────────────────────────────────────
// PATCH /api/notifications/:id/read → marquer comme lue
// ───────────────────────────────────────────────
router.patch(
  "/:id/read",
  authenticateFlexible,
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthenticated" });
      }

      const notification = await prisma.notification.findUnique({
        where: { id: req.params.id },
      });

      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const updated = await prisma.notification.update({
        where: { id: req.params.id },
        data: { readAt: new Date() },
      });

      res.json({ success: true, notification: updated });
    } catch (error) {
      console.error("[PATCH /api/notifications/:id/read]", error);
      next(error);
    }
  }
);

// ───────────────────────────────────────────────
// DELETE /api/notifications/:id → suppression
// ───────────────────────────────────────────────
router.delete(
  "/:id",
  authenticateFlexible,
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthenticated" });
      }

      const notif = await prisma.notification.findUnique({
        where: { id: req.params.id },
      });

      if (!notif || notif.userId !== userId) {
        return res.status(404).json({ error: "Notification not found" });
      }

      await prisma.notification.delete({ where: { id: req.params.id } });

      res.status(204).end();
    } catch (error) {
      console.error("[DELETE /api/notifications/:id]", error);
      next(error);
    }
  }
);

export default router;
