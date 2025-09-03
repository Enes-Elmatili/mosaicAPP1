// backend/routes/providers.missions.js
import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";
import { z } from "zod";
import { validateParams, validateBody, validateQuery } from "../middleware/validate.js";

const router = Router();

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const IdParam = z.object({ id: z.string().uuid() });
const StatusBody = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DONE", "CANCELLED"]),
});
const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ───────────────────────────────────────────────
// GET /api/providers/missions
// ───────────────────────────────────────────────
router.get(
  "/",
  authenticateFlexible,
  requireRole("PROVIDER"),
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const page = req.query.page ?? 1;
      const limit = Math.min(req.query.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const [missions, total] = await Promise.all([
        prisma.mission.findMany({
          where: { providerId: req.user.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.mission.count({ where: { providerId: req.user.id } }),
      ]);

      res.json({ success: true, page, limit, total, missions });
    } catch (e) {
      console.error("[GET /api/providers/missions]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// PATCH /api/providers/missions/:id/status
// ───────────────────────────────────────────────
router.patch(
  "/:id/status",
  authenticateFlexible,
  requireRole("PROVIDER"),
  validateParams(IdParam),
  validateBody(StatusBody),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const mission = await prisma.mission.findUnique({
        where: { id },
        select: { id: true, providerId: true, status: true },
      });

      if (!mission) return res.status(404).json({ error: "Mission not found" });
      if (mission.providerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: not your mission" });
      }

      const updated = await prisma.mission.update({
        where: { id },
        data: { status },
      });

      req.io?.to(req.user.id).emit("mission-status-updated", {
        missionId: updated.id,
        status: updated.status,
      });

      res.json({ success: true, mission: updated });
    } catch (e) {
      console.error("[PATCH /api/providers/missions/:id/status]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// POST /api/providers/missions/:id/accept
// ───────────────────────────────────────────────
router.post(
  "/:id/accept",
  authenticateFlexible,
  requireRole("PROVIDER"),
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const providerId = req.user.id;

      const result = await prisma.$transaction(async (tx) => {
        const mission = await tx.mission.findUnique({
          where: { id },
          select: { id: true, providerId: true, status: true },
        });

        if (!mission) throw new Error("NOT_FOUND");
        if (mission.status !== "PENDING") throw new Error("ALREADY_TAKEN");
        if (mission.providerId && mission.providerId !== providerId) {
          throw new Error("CONFLICT");
        }

        return tx.mission.update({
          where: { id },
          data: { providerId, status: "ACCEPTED" },
        });
      });

      req.io?.to(providerId).emit("mission-accepted", {
        missionId: result.id,
        status: result.status,
      });

      res.json({ success: true, mission: result });
    } catch (e) {
      console.error("[POST /api/providers/missions/:id/accept]", e);

      if (e.message === "NOT_FOUND") {
        return res.status(404).json({ error: "Mission not found" });
      }
      if (["ALREADY_TAKEN", "CONFLICT"].includes(e.message)) {
        return res.status(409).json({ error: "Mission already accepted" });
      }

      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// POST /api/providers/missions/:id/done
// ───────────────────────────────────────────────
router.post(
  "/:id/done",
  authenticateFlexible,
  requireRole("PROVIDER"),
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const providerId = req.user.id;

      const mission = await prisma.mission.findUnique({
        where: { id },
        select: { id: true, providerId: true, status: true },
      });

      if (!mission) return res.status(404).json({ error: "Mission not found" });
      if (mission.providerId !== providerId) {
        return res.status(403).json({ error: "Forbidden: not your mission" });
      }
      if (mission.status === "DONE") {
        return res.status(400).json({ error: "Mission already completed" });
      }

      const updated = await prisma.mission.update({
        where: { id },
        data: { status: "DONE" },
      });

      req.io?.to(providerId).emit("mission-done", {
        missionId: updated.id,
        status: updated.status,
      });

      res.json({ success: true, mission: updated });
    } catch (e) {
      console.error("[POST /api/providers/missions/:id/done]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// POST /api/providers/missions/:id/cancel
// ───────────────────────────────────────────────
router.post(
  "/:id/cancel",
  authenticateFlexible,
  requireRole("PROVIDER", "ADMIN"),
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const mission = await prisma.mission.findUnique({
        where: { id },
        select: { id: true, providerId: true, status: true },
      });

      if (!mission) return res.status(404).json({ error: "Mission not found" });
      if (mission.status === "DONE") {
        return res.status(400).json({ error: "Mission already completed" });
      }

      // Vérif rôles
      if (user.role === "PROVIDER" && mission.providerId !== user.id) {
        return res.status(403).json({ error: "Forbidden: not your mission" });
      }

      const updated = await prisma.mission.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      req.io?.emit("mission-cancelled", {
        missionId: updated.id,
        status: updated.status,
      });

      res.json({ success: true, mission: updated });
    } catch (e) {
      console.error("[POST /api/providers/missions/:id/cancel]", e);
      next(e);
    }
  }
);

export default router;
