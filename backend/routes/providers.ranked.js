// backend/routes/providers.ranked.js
import express from 'express';
import prisma from '../db/prisma.js';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /providers/ranked
 * Classe les prestataires par proximité et/ou score.
 * Query params : 
 *   - lat (float) : latitude du client
 *   - lng (float) : longitude du client
 *   - limit (int) : nb max de résultats (par défaut 20)
 */
router.get('/ranked', async (req, res) => {
  try {
    // Validation avec Zod
    const querySchema = z.object({
      lat: z.string().optional(),
      lng: z.string().optional(),
      limit: z.string().optional(),
    });
    const parsed = querySchema.parse(req.query);

    const lat = parsed.lat ? parseFloat(parsed.lat) : null;
    const lng = parsed.lng ? parseFloat(parsed.lng) : null;
    const limit = parsed.limit ? parseInt(parsed.limit, 10) : 20;

    // Récupération des prestataires
    const providers = await prisma.provider.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        latitude: true,
        longitude: true,
        score: true, // suppose un champ score dans schema.prisma
        createdAt: true,
      },
    });

    // Si pas de providers
    if (!providers.length) {
      return res.json({ providers: [] });
    }

    // Fonction distance Haversine
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371; // km
      const toRad = (x) => (x * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Calcul ranking
    const ranked = providers
      .map((p) => {
        let distance = null;
        if (lat !== null && lng !== null && p.latitude && p.longitude) {
          distance = haversine(lat, lng, p.latitude, p.longitude);
        }
        // pondération : score - distance (si dispo)
        const rankScore =
          (p.score || 0) - (distance ? distance / 10 : 0); // tu peux affiner
        return { ...p, distance, rankScore };
      })
      .sort((a, b) => b.rankScore - a.rankScore) // tri décroissant
      .slice(0, limit);

    res.json({ providers: ranked });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid query params', details: err.message });
  }
});

export default router;
