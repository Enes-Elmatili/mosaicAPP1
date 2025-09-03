import { Router } from "express";
import prisma from "../db/prisma.js";
import { z } from "zod";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateQuery, validateParams, validateBody } from "../middleware/validate.js";

const router = Router();

// ───────────────────────────────────────────────
// Zod schemas
// ───────────────────────────────────────────────
const QuerySchema = z.object({
  status: z.string().optional(), // ex: "PUBLISHED", "OPEN", "DONE"
  clientId: z.string().cuid().optional(),
  providerId: z.string().cuid().optional(),
  take: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default("20")
    .transform((n) => Math.min(n, 100)),
  cursor: z.string().optional(),
});

const RequestIdParam = z.object({
  id: z.string().regex(/^\d+$/), // Request.id est Int
});

const StatusBody = z.object({
  status: z.string().min(2),
});

const ReassignBody = z.object({
  providerId: z.string().cuid(),
});

// Middleware global → ADMIN only
router.use(authenticateFlexible, requireRole("ADMIN"));

// ───────────────────────────────────────────────
// GET /admin/requests → liste paginée
// ───────────────────────────────────────────────
router.get("/", validateQuery(QuerySchema), async (req, res, next) => {
  try {
    const { status, clientId, providerId, take, cursor } = req.query;

    const where = {
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(providerId ? { providerId } : {}),
    };

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
      take,
      select: {
        id: true,
        serviceType: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        address: true,
        lat: true,
        lng: true,
        client: { select: { id: true, email: true, name: true } },
        provider: { select: { id: true, name: true, status: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    const nextCursor =
      requests.length === take ? requests[requests.length - 1].id : null;

    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: requests, nextCursor });
  } catch (e) {
    next(e);
  }
});

// ───────────────────────────────────────────────
// GET /admin/requests/:id → détail
// ───────────────────────────────────────────────
router.get("/:id", validateParams(RequestIdParam), async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id: Number(id) },
      include: {
        client: { select: { id: true, email: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, status: true, city: true } },
        category: true,
        subcategory: true,
        photos: true,
        reviews: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ success: true, data: request });
  } catch (e) {
    next(e);
  }
});

// ───────────────────────────────────────────────
// PATCH /admin/requests/:id/status → changer statut
// ───────────────────────────────────────────────
router.patch(
  "/:id/status",
  validateParams(RequestIdParam),
  validateBody(StatusBody),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await prisma.request.update({
        where: { id: Number(id) },
        data: { status },
        select: { id: true, status: true, updatedAt: true },
      });

      res.json({ success: true, data: updated });
    } catch (e) {
      if (e?.code === "P2025")
        return res.status(404).json({ error: "Request not found" });
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// POST /admin/requests/:id/reassign → changer provider
// ───────────────────────────────────────────────
router.post(
  "/:id/reassign",
  validateParams(RequestIdParam),
  validateBody(ReassignBody),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { providerId } = req.body;

      // Vérifie que la requête existe
      const request = await prisma.request.findUnique({
        where: { id: Number(id) },
        select: { id: true, providerId: true, status: true },
      });

      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      // Vérifie que le provider existe et est actif
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true, isActive: true, status: true },
      });

      if (!provider || !provider.isActive) {
        return res.status(400).json({ error: "Invalid or inactive provider" });
      }

      // Réassignation
      const updated = await prisma.request.update({
        where: { id: Number(id) },
        data: { providerId },
        include: {
          provider: { select: { id: true, name: true, status: true } },
        },
      });

      res.json({
        success: true,
        message: "Request reassigned successfully",
        data: updated,
      });
    } catch (e) {
      if (e?.code === "P2025")
        return res.status(404).json({ error: "Request not found" });
      next(e);
    }
  }
);

export default router;
