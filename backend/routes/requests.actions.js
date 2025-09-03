// backend/routes/request.actions.js
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { validateParams } from "../middleware/validate.js";
import { io } from "../sockets/index.js";
import { recalcProviderRanking } from "../services/rankingService.js";
import { generateContract, generateInvoice } from "../services/contractService.js";

const router = Router();

// ✅ Id = entier
const IdParam = z.object({ id: z.string().regex(/^\d+$/) });

/**
 * POST /api/requests/:id/cancel (client/admin)
 */
router.post("/:id/cancel", authenticateFlexible, validateParams(IdParam), async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);

    const r = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, clientId: true, providerId: true, status: true },
    });

    if (!r) return res.status(404).json({ error: "Request not found" });

    if (req.user?.role === "CLIENT" && r.clientId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: not your request" });
    }

    if (!["PUBLISHED", "ACCEPTED"].includes(r.status) && req.user?.role !== "ADMIN") {
      return res.status(400).json({ error: `Cannot cancel request in status ${r.status}` });
    }

    const cancelled = await prisma.request.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
    });

    io.to(`request:${requestId}`).emit("request:cancelled", {
      requestId,
      by: req.user.id,
    });

    if (cancelled.providerId) {
      await recalcProviderRanking(cancelled.providerId);
    }

    res.json({ success: true, data: cancelled });
  } catch (e) {
    console.error("[POST /requests/:id/cancel]", e);
    next(e);
  }
});

/**
 * POST /api/requests/:id/accept (provider)
 * 👉 Génère un contrat juridique automatiquement
 */
router.post("/:id/accept", authenticateFlexible, validateParams(IdParam), async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);
    const providerId = req.user?.provider?.id;
    if (!providerId) return res.status(403).json({ error: "Not a provider" });

    const result = await prisma.$transaction(async (db) => {
      const r = await db.request.findUnique({
        where: { id: requestId },
        include: { user: true, provider: true },
      });
      if (!r) throw new Error("NOT_FOUND");
      if (["ACCEPTED", "DONE"].includes(r.status)) throw new Error("ALREADY_ASSIGNED");
      if (r.providerId && r.providerId !== providerId) throw new Error("OTHER_PROVIDER");

      const updated = await db.request.update({
        where: { id: requestId },
        data: { status: "ACCEPTED", providerId },
        include: { user: true, provider: true },
      });

      // 🔹 Génération du contrat
      await generateContract(updated, updated.provider, updated.id);

      return updated;
    });

    io.to(`request:${requestId}`).emit("request:accepted", { requestId, providerId });
    await recalcProviderRanking(providerId);
    res.json(result);
  } catch (e) {
    const map = { NOT_FOUND: 404, ALREADY_ASSIGNED: 409, OTHER_PROVIDER: 409 };
    if (map[e.message]) return res.status(map[e.message]).json({ error: e.message });
    next(e);
  }
});

/**
 * POST /api/requests/:id/start (provider/admin)
 * 👉 Transition explicite vers ONGOING
 */
router.post("/:id/start", authenticateFlexible, validateParams(IdParam), async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);

    const r = await prisma.request.update({
      where: { id: requestId },
      data: { status: "ONGOING" },
    });

    io.to(`request:${requestId}`).emit("request:ongoing", { requestId });
    res.json(r);
  } catch (e) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Request not found" });
    next(e);
  }
});

/**
 * POST /api/requests/:id/done (provider/admin)
 * 👉 Génère une facture automatiquement
 */
router.post("/:id/done", authenticateFlexible, validateParams(IdParam), async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);

    const result = await prisma.$transaction(async (db) => {
      const r = await db.request.update({
        where: { id: requestId },
        data: { status: "DONE" },
        include: { user: true, provider: true, contract: true },
      });

      // 🔹 Génération facture
      await generateInvoice(r, r.contract);

      return r;
    });

    io.to(`request:${requestId}`).emit("request:done", { requestId });
    if (result.providerId) await recalcProviderRanking(result.providerId);

    res.json(result);
  } catch (e) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Request not found" });
    next(e);
  }
});

export default router;
