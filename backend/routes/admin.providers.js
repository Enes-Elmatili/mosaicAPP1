import { Router } from "express";
import prisma from "../db/prisma.js";
import { z } from "zod";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateParams, validateBody, validateQuery } from "../middleware/validate.js";

const router = Router();

// ───────────────────────────────────────────────
// Schemas Zod
// ───────────────────────────────────────────────
const IdSchema = z.object({ id: z.string().cuid() });

const PatchSchema = z.object({
  isActive: z.boolean().optional(),
  premium: z.boolean().optional(),
  status: z.enum(["READY", "BUSY", "PAUSED", "OFFLINE"]).optional(),
});

const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Middleware global → ADMIN only
router.use(authenticateFlexible, requireRole("ADMIN"));

// ───────────────────────────────────────────────
// GET /admin/providers → liste paginée
// ───────────────────────────────────────────────
router.get("/", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          isActive: true,
          premium: true,
          status: true,
          avgRating: true,
          totalRatings: true,
          jobsCompleted: true,
          createdAt: true,
        },
      }),
      prisma.provider.count(),
    ]);

    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, page, limit, total, data: providers });
  } catch (e) {
    next(e);
  }
});

// ───────────────────────────────────────────────
// PATCH /admin/providers/:id → modifier statut/provider
// ───────────────────────────────────────────────
router.patch(
  "/:id",
  validateParams(IdSchema),
  validateBody(PatchSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;

      const updated = await prisma.provider.update({
        where: { id },
        data: body,
        select: {
          id: true,
          isActive: true,
          premium: true,
          status: true,
          rankScore: true,
          jobsCompleted: true,
          avgRating: true,
          totalRatings: true,
        },
      });

      res.setHeader("Cache-Control", "no-store");
      res.json({ success: true, data: updated });
    } catch (e) {
      if (e?.code === "P2025")
        return res.status(404).json({ error: "Provider not found" });
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// POST /admin/providers/:id/suspend
// ───────────────────────────────────────────────
router.post("/:id/suspend", validateParams(IdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await prisma.provider.update({
      where: { id },
      data: { isActive: false, status: "OFFLINE" },
      select: { id: true, isActive: true, status: true },
    });

    // TODO: audit log → qui a suspendu qui
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: p });
  } catch (e) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Provider not found" });
    next(e);
  }
});

// ───────────────────────────────────────────────
// POST /admin/providers/:id/activate
// ───────────────────────────────────────────────
router.post("/:id/activate", validateParams(IdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await prisma.provider.update({
      where: { id },
      data: { isActive: true, status: "READY" },
      select: { id: true, isActive: true, status: true },
    });

    // TODO: audit log → qui a activé qui
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: p });
  } catch (e) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Provider not found" });
    next(e);
  }
});

export default router;
