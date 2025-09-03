// backend/routes/me.js (ESM)
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../middleware/httpError.js";

const router = Router();
const ALLOWED_ROLES = new Set(["ADMIN", "PROVIDER", "CLIENT"]);

/**
 * GET /api/me
 * Retourne l’utilisateur courant avec rôles & permissions
 * Réponse: { id, email, roles: string[], permissions: string[] }
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new HttpError(401, "Unauthenticated");

    // 1) Récupération utilisateur
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      // fallback sur les infos du token
      const fromToken = req.user || {};
      user = { id: userId, email: fromToken.email || undefined };
    }

    // 2) Rôles et permissions
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            name: true,
            permissions: { select: { permission: { select: { key: true } } } },
          },
        },
      },
    });

    let roles = (userRoles || [])
      .map((ur) => (ur.role?.name || "").toUpperCase())
      .filter((r) => ALLOWED_ROLES.has(r));

    if (roles.length === 0 && Array.isArray(req.user?.roles)) {
      roles = req.user.roles
        .map((r) => (r || "").toUpperCase())
        .filter((r) => ALLOWED_ROLES.has(r));
    }

    const permSet = new Set(
      (userRoles || []).flatMap((ur) =>
        (ur.role?.permissions || []).map((rp) => rp.permission.key)
      )
    );

    // 3) Headers anti-cache
    res.set({
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    });

    // 4) Réponse finale
    return res.json({
      id: user.id,
      email: user.email,
      roles,                           // ex: ["ADMIN","CLIENT"]
      role: roles[0] || null,          // rôle principal
      permissions: Array.from(permSet) // ex: ["REQUEST_CREATE","REQUEST_READ"]
    });
  } catch (e) {
    next(e);
  }
});

export default router;
