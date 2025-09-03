import { Router } from "express";
import prisma from "../db/prisma.js";
import { z } from "zod";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateQuery, validateParams, validateBody } from "../middleware/validate.js"; // 👈 ajouté validateParams + validateBody

const router = Router();

// ───────────────────────────────────────────────
// Zod schemas
// ───────────────────────────────────────────────
const QuerySchema = z.object({
  q: z.string().trim().optional(),
  role: z.enum(["ADMIN", "CLIENT", "PROVIDER"]).optional(),
  take: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default("20")
    .transform((n) => Math.min(n, 100)),
  cursor: z.string().cuid().optional(),
});

const UserIdParam = z.object({ id: z.string().cuid() });

const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["ADMIN", "CLIENT", "PROVIDER"]).optional(),
});

// Middleware global → ADMIN only
router.use(authenticateFlexible, requireRole("ADMIN"));

// ───────────────────────────────────────────────
// GET /admin/users
// ───────────────────────────────────────────────
router.get("/", validateQuery(QuerySchema), async (req, res, next) => {
  try {
    const { q, role, take, cursor } = req.query;

    const where = {
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role ? { userRoles: { some: { role: { name: role } } } } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        userRoles: { select: { role: { select: { name: true } } } },
        provider: {
          select: {
            id: true,
            status: true,
            avgRating: true,
            totalRatings: true,
            rankScore: true,
            jobsCompleted: true,
            isActive: true,
            premium: true,
            city: true,
            lat: true,
            lng: true,
          },
        },
        _count: { select: { requests: true, reviews: true } },
        wallet: { select: { balance: true } },
      },
    });

    const nextCursor = users.length === take ? users[users.length - 1].id : null;

    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: users, nextCursor });
  } catch (e) {
    next(e);
  }
});

// ───────────────────────────────────────────────
// GET /admin/users/:id → détail complet d’un utilisateur
// ───────────────────────────────────────────────
router.get("/:id", validateParams(UserIdParam), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
        provider: {
          select: {
            id: true,
            city: true,
            status: true,
            avgRating: true,
            totalRatings: true,
            jobsCompleted: true,
            premium: true,
            rankScore: true,
            isActive: true,
            lat: true,
            lng: true,
            createdAt: true,
          },
        },
        wallet: {
          select: {
            balance: true,
            txs: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: {
                id: true,
                amount: true,
                type: true,
                reference: true,
                balanceBefore: true,
                balanceAfter: true,
                createdAt: true,
              },
            },
          },
        },
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        files: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            filename: true,
            original: true,
            url: true,
            size: true,
            mimetype: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            requests: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: user });
  } catch (e) {
    console.error("[GET /admin/users/:id]", e);
    next(e);
  }
});

// ───────────────────────────────────────────────
// PATCH /admin/users/:id → mise à jour (role, isActive, email)
// ───────────────────────────────────────────────
router.patch(
  "/:id",
  validateParams(UserIdParam),
  validateBody(UserUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, isActive, role } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { email, isActive },
      });

      // Mise à jour du rôle si fourni
      if (role) {
        await prisma.userRole.deleteMany({ where: { userId: id } });
        await prisma.userRole.create({
          data: { userId: id, role: { connect: { name: role } } },
        });
      }

      res.json({ success: true, data: updatedUser });
    } catch (e) {
      if (e?.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("[PATCH /admin/users/:id]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// DELETE /admin/users/:id → suppression
// ───────────────────────────────────────────────
router.delete("/:id", validateParams(UserIdParam), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted" });
  } catch (e) {
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("[DELETE /admin/users/:id]", e);
    next(e);
  }
});

export default router;
