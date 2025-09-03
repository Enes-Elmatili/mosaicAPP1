// backend/routes/auth.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../db/prisma.js";

const ALLOWED_ROLES = new Set(["PROVIDER", "ADMIN", "CLIENT"]);
const router = Router();

// Génère un JWT et le place en cookie sécurisé
function signAndSetCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET || "dev", {
    expiresIn: "7d",
  });

  res.cookie("session", token, {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });

  return token;
}

/**
 * GET /api/auth/me
 * Retourne l’utilisateur courant
 */
router.get("/me", async (req, res) => {
  try {
    const token =
      req.cookies?.session || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roles = user.userRoles.map((r) => r.role?.name).filter(Boolean);

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        role: roles[0] || null,
      },
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const email = req.body?.email || req.query?.email;
    const password = req.body?.password || req.query?.password;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: { select: { name: true } } },
    });

    const roles = userRoles
      .map((r) => (r.role?.name || "").toUpperCase())
      .filter((n) => ALLOWED_ROLES.has(n));

    if (roles.length === 0) {
      return res
        .status(403)
        .json({ error: "No valid role assigned for this user" });
    }

    const payload = { sub: user.id, email: user.email, roles };
    const token = signAndSetCookie(res, payload);

    res.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, roles, role: roles[0] },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const normalizeRole = (r) => {
      const x = (r || "").toString().toUpperCase();
      return ALLOWED_ROLES.has(x) ? x : "PROVIDER";
    };
    const roles = [normalizeRole(role)];

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: name || null,
      },
      select: { id: true, email: true },
    });

    try {
      const roleRow = await prisma.role.findFirst({
        where: { name: roles[0] },
      });
      if (roleRow) {
        await prisma.userRole.create({
          data: { userId: created.id, roleId: roleRow.id },
        });
      }
    } catch {
      // ignore si table roles vide
    }

    const payload = { sub: created.id, email: created.email, roles };
    const token = signAndSetCookie(res, payload);

    res.status(201).json({
      ok: true,
      token,
      user: { id: created.id, email: created.email, roles, role: roles[0] },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (_req, res) => {
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});

/**
 * POST /api/auth/refresh
 * Rafraîchir le JWT existant
 */
router.post("/refresh", async (req, res) => {
  try {
    const oldToken =
      req.cookies?.session || req.headers.authorization?.split(" ")[1];
    if (!oldToken) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET || "dev");
    const payload = { sub: decoded.sub, email: decoded.email, roles: decoded.roles };

    const newToken = signAndSetCookie(res, payload);

    res.json({ ok: true, token: newToken });
  } catch (err) {
    console.error("Error in /refresh:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
// backend/routes/auth.js