// backend/services/rankingService.js
import { prisma } from "../db/prisma.js";

/**
 * Calcule le score de ranking pour un provider.
 * Formule basée sur ton schéma Prisma (avgRating, jobs, réponses, premium).
 */
export function computeRankScore(p) {
  let score = 0;

  score += (p.jobsCompleted || 0) * 2;

  if (p.totalRatings > 0) {
    const ratingWeight = Math.min(p.totalRatings, 50) / 50; // max poids à 50 reviews
    score += (p.avgRating || 0) * 20 * ratingWeight;
  }

  if (p.totalRequests > 0) {
    const acceptanceRate = p.acceptedRequests / p.totalRequests;
    score += acceptanceRate * 15;

    const declineRate = p.declinedRequests / p.totalRequests;
    score -= declineRate * 10;
  }

  if (p.avgResponseTimeSec > 0) {
    if (p.avgResponseTimeSec <= 3600) score += 10;
    else if (p.avgResponseTimeSec <= 4 * 3600) score += 5;
    else if (p.avgResponseTimeSec > 24 * 3600) score -= 10;
  }

  if (p.premium) score += 20;

  return Math.max(score, 0);
}

/**
 * Met à jour le rankScore d'un provider en DB
 * @param {string} providerId
 * @returns {Promise<number>} nouveau score
 */
export async function updateProviderRank(providerId) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      jobsCompleted: true,
      avgRating: true,
      totalRatings: true,
      totalRequests: true,
      acceptedRequests: true,
      declinedRequests: true,
      avgResponseTimeSec: true,
      premium: true,
    },
  });

  if (!provider) throw new Error("Provider not found");

  const score = computeRankScore(provider);

  await prisma.provider.update({
    where: { id: providerId },
    data: { rankScore: score },
  });

  return score;
}

/**
 * Recalcule le ranking pour tous les providers
 * @returns {Promise<Array<{id:string, rankScore:number}>>}
 */
export async function recomputeAllRanks() {
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      jobsCompleted: true,
      avgRating: true,
      totalRatings: true,
      totalRequests: true,
      acceptedRequests: true,
      declinedRequests: true,
      avgResponseTimeSec: true,
      premium: true,
    },
  });

  const results = [];

  for (const p of providers) {
    const score = computeRankScore(p);
    await prisma.provider.update({
      where: { id: p.id },
      data: { rankScore: score },
    });
    results.push({ id: p.id, rankScore: score });
  }

  return results;
}

/**
 * Alias attendu par requests.actions.js
 */
export async function recalcProviderRanking(providerId) {
  return updateProviderRank(providerId);
}

/**
 * Export par défaut uniformisé
 */
export default {
  computeRankScore,
  updateProviderRank,
  recomputeAllRanks,
  recalcProviderRanking,
};
