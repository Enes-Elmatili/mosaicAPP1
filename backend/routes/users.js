// backend/routes/users.js
import express from "express";
import bcrypt from "bcrypt"; // ✅ importer une fois en haut
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";

const router = express.Router();

/**
 * POST /api/users
 * → Crée un utilisateur (client ou provider)
 * → Accessible uniquement aux ADMIN
 */
router.post("/", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { email, name, password, role, providerData } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "email, password et role sont requis" });
    }

    // Validation basique
    if (!email.includes("@")) {
      return res.status(400).json({ error: "email invalide" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Mot de passe trop court (min 6 caractères)" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Créer l’utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        isActive: true,
        userRoles: {
          create: {
            role: { connect: { name: role.toUpperCase() } }, // "CLIENT" | "PROVIDER" | "ADMIN"
          },
        },
        provider:
          role.toUpperCase() === "PROVIDER"
            ? {
                create: {
                  status: "READY",
                  city: providerData?.city || null,
                  lat: providerData?.lat || null,
                  lng: providerData?.lng || null,
                  isActive: true,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
        provider: {
          select: { id: true, status: true, city: true, lat: true, lng: true },
        },
      },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }
    next(err);
  }
});

/**
 * GET /api/users
 * → Liste paginée de tous les utilisateurs
 * → ADMIN uniquement
 */
router.get("/", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
        provider: {
          select: {
            id: true,
            status: true,
            city: true,
            lat: true,
            lng: true,
            isActive: true,
          },
        },
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id
 * → Détail d’un utilisateur
 * → ADMIN uniquement
 */
router.get("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
        provider: {
          select: {
            id: true,
            status: true,
            city: true,
            lat: true,
            lng: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/:id/status
 * → Activer / suspendre un utilisateur (provider ou client)
 * → ADMIN uniquement
 */
router.patch("/:id/status", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, email: true, isActive: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/:id/provider-status
 * → Modifier le statut d’un provider (READY | PAUSED | BUSY | OFFLINE)
 * → ADMIN uniquement
 */
router.patch("/:id/provider-status", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["READY", "PAUSED", "BUSY", "OFFLINE"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, city: true, lat: true, lng: true },
    });

    res.json(provider);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/:id
 * → Mise à jour des infos d’un utilisateur (ADMIN uniquement)
 */
router.patch("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, phone, name, address, isActive } = req.body;

    // Vérif basique
    if (email && !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
    });

    res.json(user);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    next(err);
  }
});
/**
 * PATCH /api/users/:id/location
 * → Mettre à jour la localisation d’un provider
 * → ADMIN uniquement
 */
router.patch("/:id/location", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city, lat, lng } = req.body;

    const provider = await prisma.provider.update({
      where: { id },
      data: { city, lat, lng },
      select: { id: true, city: true, lat: true, lng: true },
    });

    res.json(provider);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/:id/assign-request
 * → Assigner une demande (request) à un provider
 * → ADMIN uniquement
 */
router.post("/:id/assign-request", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params; // providerId
    const { requestId } = req.body;

    const request = await prisma.request.update({
      where: { id: requestId },
      data: { providerId: id },
      select: { id: true, status: true, providerId: true },
    });

    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/:id
 * → Supprimer un utilisateur
 * → ADMIN uniquement
 */
router.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
