// backend/routes/requests.read.js
import { Router } from "express";
import { z } from "zod";
import prisma from "../db/prisma.js";
import { validateQuery, validateParams } from "../middleware/validate.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";

const router = Router();

// ──────────────────────────────
// Zod schemas
// ──────────────────────────────
const QuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
  status: z.string().optional(),
  providerId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  urgent: z.enum(["true", "false"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const IdParam = z.object({ id: z.string().regex(/^\d+$/) });

// Middleware global → accessible ADMIN et PROVIDER, un client ne peut lire que les siennes
router.use(authenticateFlexible);

// ──────────────────────────────
// GET /api/requests (paginated list)
// ──────────────────────────────
router.get("/", validateQuery(QuerySchema), async (req, res, next) => {
  try {
    const { page, limit, status, providerId, clientId, urgent, from, to } = req.query;
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where = {
      ...(status ? { status } : {}),
      ...(providerId ? { providerId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(urgent ? { urgent: urgent === "true" } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    // Si user est CLIENT, il ne peut voir que ses propres requêtes
    if (req.user?.role === "CLIENT") {
      where.clientId = req.user.id;
    }

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          provider: { select: { id: true, name: true, city: true, status: true } },
          client: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({ success: true, page, limit: take, total, items });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────
// GET /api/requests/:id
// ──────────────────────────────
router.get("/:id", validateParams(IdParam), async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, name: true, status: true } },
        client: { select: { id: true, email: true, name: true } },
        category: true,
        subcategory: true,
        reviews: true,
      },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    // Restriction pour les clients
    if (req.user?.role === "CLIENT" && request.clientId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

export default router;
