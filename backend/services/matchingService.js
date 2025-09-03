// backend/services/matchingService.js
import { prisma } from "../db/prisma.js";
import { io, providerSockets } from "../sockets/index.js"; // ✅ corrigé

/**
 * Trouve le meilleur provider pour une requête donnée
 * et envoie la notification en temps réel via socket.io
 * @param {number} requestId
 * @returns {Promise<{id:string,name:string,distanceKm:number}|null>}
 */
export const findBestProvider = async (requestId) => {
  // 1. Charger la requête depuis la DB
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { client: true, category: true, subcategory: true },
  });

  if (!request) {
    throw new Error(`❌ Request ${requestId} introuvable`);
  }

  console.log(
    `🔎 Recherche de provider pour requête #${request.id} (${request.serviceType})`
  );

  // 2. Récupérer les providers READY actifs
  const providers = await prisma.provider.findMany({
    where: {
      status: "READY",
      isActive: true,
    },
    take: 50,
  });

  if (providers.length === 0) {
    console.warn("❌ Aucun provider actif trouvé");
    return null;
  }

  // 3. Calculer la distance
  const providersWithDistance = providers.map((p) => {
    const distanceKm = calculateDistance(
      { lat: request.lat, lon: request.lng },
      { lat: p.lat ?? 0, lon: p.lng ?? 0 }
    );
    return { ...p, distanceKm };
  });

  // 4. Trier par score
  const sorted = providersWithDistance.sort((a, b) => {
    const scoreA =
      (a.avgRating ?? 0) +
      (a.rankScore ?? 0) -
      ((a.avgResponseTimeSec ?? 0) / 60) -
      a.distanceKm / 10;

    const scoreB =
      (b.avgRating ?? 0) +
      (b.rankScore ?? 0) -
      ((b.avgResponseTimeSec ?? 0) / 60) -
      b.distanceKm / 10;

    return scoreB - scoreA;
  });

  const bestProvider = sorted[0];

  console.log(
    `✅ Provider sélectionné: ${bestProvider.name} (${bestProvider.id}), distance ${bestProvider.distanceKm.toFixed(
      2
    )} km`
  );

  // 5. Notifier via Socket.IO
  const socketId = providerSockets.get(bestProvider.id);
  if (socketId && io) {
    io.to(socketId).emit("new_request", {
      requestId: request.id,
      description: request.description,
      address: request.address,
      urgent: request.urgent,
      serviceType: request.serviceType,
    });
    console.log(
      `📩 Notification envoyée à ${bestProvider.name} via socket ${socketId}`
    );
  } else {
    console.warn(
      `⚠️ Provider ${bestProvider.id} sélectionné mais pas connecté via socket.io`
    );
  }

  return {
    id: bestProvider.id,
    name: bestProvider.name,
    distanceKm: bestProvider.distanceKm,
  };
};

/**
 * Alias pour compatibilité avec d'autres imports
 * @param {number} requestId
 */
export async function matchRequestToProviders(requestId) {
  return findBestProvider(requestId);
}

/**
 * Calcul de la distance Haversine en km entre deux points GPS
 * @param {{lat:number,lon:number}} loc1
 * @param {{lat:number,lon:number}} loc2
 * @returns {number}
 */
function calculateDistance(loc1, loc2) {
  const R = 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

// 👇 Export par défaut uniformisé
export default {
  findBestProvider,
  matchRequestToProviders, // ✅ alias ajouté
};
