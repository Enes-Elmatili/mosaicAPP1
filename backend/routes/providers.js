import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { z } from "zod";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { invalidateAll as invalidateProvidersCache } from "../utils/cache.js";

const router = Router();

// ───────────────────────────────────────────────
// Utilitaire distance Haversine (km)
// ───────────────────────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const QueryList = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  city: z.string().optional(),
  status: z.enum(["READY", "PAUSED", "OFFLINE", "BUSY"]).optional(),
  premium: z.string().transform((v) => v === "true").optional(),
});

const ProviderIdParam = z.object({ id: z.string().uuid() });

const ProviderBody = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
});

const LocationBody = z.object({
  lat: z.number(),
  lng: z.number(),
});

const StatusBody = z.object({
  status: z.enum(["READY", "PAUSED", "OFFLINE", "BUSY"]),
});

// ───────────────────────────────────────────────
// GET /api/providers/me → provider by current user
// ───────────────────────────────────────────────
router.get("/me", authenticateFlexible, requireRole("PROVIDER"), async (req, res) => {
  try {
    const provider = await prisma.provider.findFirst({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json({ success: true, provider });
  } catch (err) {
    console.error("[GET /api/providers/me]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// GET /api/providers/earnings → this month + wallet balance
// ───────────────────────────────────────────────
router.get("/earnings", authenticateFlexible, requireRole("PROVIDER"), async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await prisma.provider.findFirst({ where: { userId }, select: { id: true, avgRating: true } });
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthPayments = await prisma.payment.findMany({
      where: { providerId: provider.id, status: "completed", createdAt: { gte: startOfMonth } },
      select: { amount: true, currency: true },
    });
    const monthTotal = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const currency = monthPayments[0]?.currency || "MAD";

    const wallet = await prisma.walletAccount.findUnique({ where: { userId }, select: { balance: true } });

    res.json({
      success: true,
      earnings: { monthTotal, currency },
      wallet: { balance: wallet?.balance || 0 },
      rating: { avgRating: provider.avgRating || 0 },
    });
  } catch (err) {
    console.error("[GET /api/providers/earnings]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// GET /api/providers → liste paginée et filtrée
// ───────────────────────────────────────────────
router.get("/", validateQuery(QueryList), async (req, res) => {
  try {
    const { page = 1, limit = 20, city, status, premium } = req.query;
    const take = Math.min(limit ?? 20, 100);
    const skip = (page - 1) * take;

    const where = {};
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (status) where.status = status;
    if (premium !== undefined) where.premium = premium;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          status: true,
          premium: true,
          avgRating: true,
          lastActiveAt: true,
        },
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({ success: true, page, total, providers });
  } catch (err) {
    console.error("[GET /api/providers]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// GET /api/providers/:id → détail
// ───────────────────────────────────────────────
router.get("/:id", validateParams(ProviderIdParam), async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { id: req.params.id } });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json({ success: true, provider });
  } catch (err) {
    console.error("[GET /api/providers/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// POST /api/providers → création (admin/tests)
// ───────────────────────────────────────────────
router.post("/", validateBody(ProviderBody), async (req, res) => {
  try {
    const provider = await prisma.provider.create({ data: req.body });
    invalidateProvidersCache();
    res.status(201).json({ success: true, provider });
  } catch (err) {
    console.error("[POST /api/providers]", err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// DELETE /api/providers/:id
// ───────────────────────────────────────────────
router.delete("/:id", validateParams(ProviderIdParam), async (req, res) => {
  try {
    await prisma.provider.delete({ where: { id: req.params.id } });
    invalidateProvidersCache();
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/providers/:id]", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ───────────────────────────────────────────────
// PATCH /api/providers/status → provider connecté
// ───────────────────────────────────────────────
router.patch(
  "/status",
  authenticateFlexible,
  requireRole("PROVIDER"),
  validateBody(StatusBody.extend({ lat: z.number().optional(), lng: z.number().optional() })),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const providerRow = await prisma.provider.findFirst({ where: { userId }, select: { id: true } })
      if (!providerRow) return res.status(404).json({ error: "Provider not found" });

      const provider = await prisma.provider.update({
        where: { id: providerRow.id },
        data: { ...req.body, lastActiveAt: new Date() },
      });

      invalidateProvidersCache();
      req.io?.emit("provider-status-changed", {
        id: providerRow.id,
        status: provider.status,
        lat: provider.lat,
        lng: provider.lng,
      });

      res.json({ success: true, provider });
    } catch (err) {
      console.error("[PATCH /api/providers/status]", err);
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ───────────────────────────────────────────────
// GET /api/providers/nearby → providers READY autour
// ───────────────────────────────────────────────
router.get(
  "/nearby",
  validateQuery(
    z.object({
      lat: z.string().transform(Number),
      lng: z.string().transform(Number),
      radius: z.string().transform(Number).optional(),
    })
  ),
  async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
      const radiusKm = radius ?? 5;

      const providers = await prisma.provider.findMany({
        where: { status: "READY", lat: { not: null }, lng: { not: null }, isActive: true },
      });

      const nearby = providers
        .map((p) => ({
          ...p,
          distance: haversineDistance(lat, lng, p.lat, p.lng),
        }))
        .filter((p) => p.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50);

      res.json({ success: true, providers: nearby });
    } catch (err) {
      console.error("[GET /api/providers/nearby]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ───────────────────────────────────────────────
// PATCH /api/providers/:id/location
// ───────────────────────────────────────────────
router.patch(
  "/:id/location",
  validateParams(ProviderIdParam),
  validateBody(LocationBody),
  async (req, res) => {
    try {
      const updatedProvider = await prisma.provider.update({
        where: { id: req.params.id },
        data: req.body,
      });
      invalidateProvidersCache();
      res.json({ success: true, updatedProvider });
    } catch (err) {
      console.error("[PATCH /api/providers/:id/location]", err);
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ───────────────────────────────────────────────
// PATCH /api/providers/:id/status (admin)
// ───────────────────────────────────────────────
router.patch(
  "/:id/status",
  validateParams(ProviderIdParam),
  validateBody(StatusBody),
  async (req, res) => {
    try {
      const updatedProvider = await prisma.provider.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
      });
      invalidateProvidersCache();
      res.json({ success: true, updatedProvider });
    } catch (err) {
      console.error("[PATCH /api/providers/:id/status]", err);
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
