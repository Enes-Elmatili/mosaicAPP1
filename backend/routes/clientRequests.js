import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js"; // 👈 middleware qui récupère userId

const router = Router();

// GET /api/client/requests
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // depuis le token
    const requests = await prisma.request.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
