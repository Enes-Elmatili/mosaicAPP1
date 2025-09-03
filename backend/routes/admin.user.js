import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

/**
 * GET /admin/users
 */
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q ?? "").toString().trim();
    const role = req.query.role?.toString().toUpperCase();
    const take = Math.min(parseInt(req.query.take ?? "20", 10), 100);
    const cursor = req.query.cursor?.toString();

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
      ...(role
        ? { userRoles: { some: { role: { name: role } } } }
        : {}),
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
        walletAccount: { select: { balance: true } },
      },
    });

    const nextCursor = users.length === take ? users[users.length - 1].id : null;
    res.setHeader("Cache-Control", "no-store");
    res.json({ items: users, nextCursor });
  } catch (e) {
    next(e);
  }
});

export default router;
