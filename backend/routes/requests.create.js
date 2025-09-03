// backend/routes/requests.create.js
import { Router } from "express";
import { z } from "zod";
import prisma from "../db/prisma.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { validateBody } from "../middleware/validate.js";
import { matchRequestToProviders } from "../services/matchingService.js";

const router = Router();

// ──────────────────────────────
// Validation du body
// ──────────────────────────────
const Body = z.object({
  categoryId: z.number().int(),
  subcategoryId: z.number().int(),
  serviceType: z.string().min(2),
  description: z.string().min(5),
  address: z.string().min(3),
  lat: z.number().refine((n) => Math.abs(n) <= 90, {
    message: "Latitude invalide",
  }),
  lng: z.number().refine((n) => Math.abs(n) <= 180, {
    message: "Longitude invalide",
  }),
  urgent: z.boolean().optional().default(false),
});

// ──────────────────────────────
// POST /api/requests/create
// ──────────────────────────────
router.post("/", authenticateFlexible, validateBody(Body), async (req, res, next) => {
  try {
    // Sécurité : toujours prendre l’ID du user connecté
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ error: "Unauthorized: client required" });
    }

    // Création de la requête
    const request = await prisma.request.create({
      data: {
        clientId,
        categoryId: req.body.categoryId,
        subcategoryId: req.body.subcategoryId,
        serviceType: req.body.serviceType,
        description: req.body.description,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        geohash: "todo", // TODO: calculer geohash en prod
        urgent: req.body.urgent ?? false,
        status: "PUBLISHED",
      },
      include: {
        client: { select: { id: true, email: true, name: true } },
        category: true,
        subcategory: true,
      },
    });

    // 🔔 Envoi aux providers en temps réel
    let assignedProviders = [];
    try {
      assignedProviders = await matchRequestToProviders(request);
    } catch (err) {
      console.error("[matchRequestToProviders] failed:", err);
    }

    res.status(201).json({
      success: true,
      data: request,
      assignedProviders: assignedProviders || [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
