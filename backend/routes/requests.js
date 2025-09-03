// backend/routes/requests.js
import { Router } from "express";
import prisma from "../db/prisma.js";
import {
  buildGeoFieldsForRequest,
  sqlBbox,
  shortlistByRadius,
} from "../../src/lib/geo.js";

const router = Router();

/**
 * POST /api/requests
 * Crée une demande (clientEmail + géoloc + provider matching)
 */
router.post("/", async (req, res) => {
  try {
    const {
      clientEmail,
      categoryName,
      subcategorySlug,
      serviceType,
      description,
      address,
      lat,
      lng,
      clientInfo = null,
      urgent = false,
      preferredTimeStart = null,
      preferredTimeEnd = null,
      searchRadiusKm = 15,
      priority = null,
      photos = [],
    } = req.body || {};

    // validations minimales
    if (
      !clientEmail ||
      !categoryName ||
      !subcategorySlug ||
      !serviceType ||
      !description ||
      !address
    ) {
      return res.status(400).json({
        error:
          "Requis: clientEmail, categoryName, subcategorySlug, serviceType, description, address",
      });
    }

    const latN = Number(lat),
      lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
      return res.status(400).json({ error: "lat & lng doivent être numériques" });
    }

    // Client
    const client = await prisma.user.findUnique({
      where: { email: clientEmail },
    });
    if (!client) return res.status(400).json({ error: "clientEmail introuvable" });

    // Catégorie + sous-catégorie
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });
    if (!category)
      return res.status(400).json({ error: `Catégorie inconnue: ${categoryName}` });

    const sub = await prisma.subcategory.findFirst({
      where: { categoryId: category.id, slug: subcategorySlug },
    });
    if (!sub)
      return res
        .status(400)
        .json({ error: `Sous-catégorie inconnue: ${subcategorySlug}` });

    // Geohash
    const { geohash } = buildGeoFieldsForRequest(latN, lngN, {
      geohashPrecision: 7,
    });

    // Shortlist prestataires proches
    const { minLat, maxLat, minLng, maxLng } = sqlBbox(
      latN,
      lngN,
      Number(searchRadiusKm)
    );
    const candidates = await prisma.provider.findMany({
      where: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
      take: 300,
    });
    const nearby = shortlistByRadius(candidates, latN, lngN, Number(searchRadiusKm)).sort(
      (a, b) =>
        (b.rankScore ?? 0) - (a.rankScore ?? 0) || a.distanceKm - b.distanceKm
    );
    const chosen = nearby[0] ?? null;

    // Création Request
    const created = await prisma.request.create({
      data: {
        clientId: client.id,
        propertyId: null,
        categoryId: category.id,
        subcategoryId: sub.id,
        serviceType,
        description,
        clientInfo,
        urgent: !!urgent,
        providerId: chosen?.id ?? null,
        providerDistanceKm: chosen?.distanceKm ?? 0,
        contractUrl: null,
        address,
        lat: latN,
        lng: lngN,
        geohash,
        preferredTimeStart,
        preferredTimeEnd,
        priority: priority?.toUpperCase?.() || null,
        photos,
        status: "PUBLISHED",
      },
      include: { provider: true, category: true, subcategory: true },
    });

    // 🔥 notify via Socket.IO
    const io = req.app.get("io");
    io.emit("new-request", created);

    return res.status(201).json({
      request: created,
      assignedProvider: chosen
        ? { id: chosen.id, name: chosen.name, distanceKm: chosen.distanceKm }
        : null,
    });
  } catch (e) {
    console.error("POST /requests error", e);
    return res.status(500).json({ error: "internal error" });
  }
});

/**
 * GET /api/requests
 */
router.get("/", async (req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: requests, total: requests.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/requests/:id
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const updated = await prisma.request.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    const io = req.app.get("io");
    io.emit("request-updated", updated);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/requests/:id
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.request.delete({ where: { id: Number(req.params.id) } });

    const io = req.app.get("io");
    io.emit("request-deleted", { id: Number(req.params.id) });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
