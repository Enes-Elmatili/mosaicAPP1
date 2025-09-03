import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";

const router = Router();

// /top → top 10 des meilleurs providers
router.get(
  "/",
  authenticateFlexible,
  requireRole("ADMIN", "CLIENT"),
  async (_req, res, next) => {
    try {
      const topProviders = await prisma.provider.findMany({
        orderBy: { avgRating: "desc" },
        take: 10,
        select: {
          id: true,
          city: true,
          avgRating: true,
          jobsCompleted: true,
          premium: true,
        },
      });
      res.json(topProviders);
    } catch (e) {
      next(e);
    }
  }
);

export default router;

