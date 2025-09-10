// backend/services/dispatchService.js
import { prisma } from "../db/prisma.js";
import { io, providerSockets } from "../sockets/index.js";

/**
 * Calcule la distance Haversine en km
 */
function calculateDistance(loc1, loc2) {
  const R = 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(value) {
  return (value * Math.PI) / 180;
}

/**
 * Dispatch une requête client aux meilleurs providers
 * → notify plusieurs providers, classés par score
 */
export async function dispatchRequest(requestId) {
  // 1. Charger la requête
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { client: true, category: true, subcategory: true },
  });
  if (!request) throw new Error(`❌ Request ${requestId} introuvable`);

  // 2. Récupérer providers READY actifs
  const providers = await prisma.provider.findMany({
    where: { status: "READY", isActive: true },
    take: 50,
  });
  if (providers.length === 0) {
    console.warn("⚠️ Aucun provider READY trouvé");
    return { request, topProviders: [] };
  }

  // 3. Calculer distance + score
  const scored = providers.map((p) => {
    const distanceKm = calculateDistance(
      { lat: request.lat, lon: request.lng },
      { lat: p.lat ?? 0, lon: p.lng ?? 0 }
    );
    const score =
      (p.avgRating ?? 0) +
      (p.rankScore ?? 0) -
      ((p.avgResponseTimeSec ?? 0) / 60) -
      distanceKm / 10;

    return { ...p, distanceKm, score };
  });

  // 4. Trier & garder les meilleurs
  const sorted = scored.sort((a, b) => b.score - a.score);
  const topProviders = sorted.slice(0, 3);

  // 5. Notifier via Socket.IO
  for (const prov of topProviders) {
    const socketId = providerSockets.get(prov.id);
    if (socketId && io) {
      io.to(socketId).emit("new_request", {
        requestId: request.id,
        description: request.description,
        address: request.address,
        urgent: request.urgent,
        serviceType: request.serviceType,
      });
      console.log(`📩 Requête #${request.id} envoyée à ${prov.name}`);
    } else {
      console.warn(`⚠️ Provider ${prov.id} sélectionné mais pas connecté`);
    }
  }

  return { request, topProviders };
}

/**
 * Alias pour compatibilité
 */
export async function matchRequestToProviders(requestOrId) {
  const id = typeof requestOrId === "number" ? requestOrId : requestOrId.id;
  const result = await dispatchRequest(id);
  return result.topProviders?.[0] || null;
}

export default {
  dispatchRequest,
  matchRequestToProviders,
};
