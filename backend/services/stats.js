import { parseISO, startOfMonth, subMonths, format } from "date-fns";

function clampDate(d) {
  try {
    return d instanceof Date ? d : parseISO(String(d));
  } catch {
    return new Date();
  }
}

function monthKey(d) {
  return format(startOfMonth(d), "yyyy-MM");
}

/**
 * Compute monthly counts for the last 12 months based on a list of items with createdAt.
 */
export function computeMonthlyCounts(items) {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(startOfMonth(now), i);
    months.push({ key: monthKey(d), count: 0 });
  }
  const index = new Map(months.map((m, i) => [m.key, i]));
  for (const it of items || []) {
    const k = monthKey(clampDate(it.createdAt));
    const idx = index.get(k);
    if (idx !== undefined) months[idx].count += 1;
  }
  return months;
}

/**
 * Build aggregations maps from Request[] or MaintenanceRequest[]
 */
function aggregateMaps(requests = []) {
  const byStatus = {};
  const byService = {};
  for (const r of requests) {
    const s = (r.status || "unknown").toLowerCase();
    const sv = (r.serviceType || "other").toLowerCase();
    byStatus[s] = (byStatus[s] || 0) + 1;
    byService[sv] = (byService[sv] || 0) + 1;
  }
  return { byStatus, byService };
}

/**
 * Compute overview KPIs based on DB via prisma
 */
export async function getOverview(prisma, since) {
  const where = since ? { createdAt: { gte: clampDate(since) } } : {};

  // --- Requests (classiques + maintenance) ---
  const rq = prisma?.request;
  const mr = prisma?.maintenanceRequest;

  if (!rq || !mr) {
    console.error("[STATS] Prisma n’expose pas request ou maintenanceRequest");
    return {
      totalRequests: 0,
      openRequests: 0,
      usersInRequests: 0,
      providersInRequests: 0,
      avgFirstResponseTime: 0,
      completionRate: 0,
      requestsByStatus: {},
      requestsByService: {},
      monthlyCounts: [],
      totalUsers: 0,
      usersByRole: [],
      totalProviders: 0,
      providersByStatus: [],
      totalRoles: 0,
      totalPermissions: 0,
      totalWalletBalance: 0,
      avgWalletBalance: 0,
      payments: { totalCount: 0, totalAmount: 0 },
      ratings: { avgScore: 0, totalRatings: 0 },
    };
  }

  const [
    rqCount,
    rqList,
    rqSamples,
    mrCount,
    mrList,
    mrSamples,
  ] = await Promise.all([
    rq.count({ where }),
    rq.findMany({ where, orderBy: { createdAt: "desc" } }),
    rq.findMany({
      where, // ✅ on enlève le filtre qui excluait PUBLISHED
      select: { createdAt: true, updatedAt: true },
      take: 200,
    }),
    mr.count({ where }),
    mr.findMany({ where, orderBy: { createdAt: "desc" } }),
    mr.findMany({
      where, // ✅ on enlève le filtre qui excluait pending
      select: { createdAt: true, updatedAt: true },
      take: 200,
    }),
  ]);

  const totalRequests = rqCount + mrCount;
  const allRequests = [...rqList, ...mrList];
  const allSamples = [...rqSamples, ...mrSamples];

  const openRequests = allRequests.filter((r) =>
    ["open", "pending", "in_progress", "published"].includes(
      String(r.status).toLowerCase()
    )
  ).length;

  const usersCount = new Set(allRequests.map((r) => r.clientId)).size;
  const providersCount = new Set(allRequests.map((r) => r.providerId)).size;

  const done = allRequests.filter(
    (r) => String(r.status).toLowerCase() === "done"
  ).length;
  const completionRate =
    totalRequests > 0 ? Math.round((done / totalRequests) * 100) : 0;

  let avgFirstResponseTime = 0;
  if (allSamples.length) {
    const sum = allSamples.reduce(
      (acc, r) => acc + (new Date(r.updatedAt) - new Date(r.createdAt)),
      0
    );
    avgFirstResponseTime = Math.round(sum / allSamples.length);
  }

  const { byStatus, byService } = aggregateMaps(allRequests);
  const monthly = computeMonthlyCounts(allRequests).map((m) => ({
    month: m.key,
    count: m.count,
  }));

  // --- Autres stats utiles pour un MVP ---
  const [
    totalUsers,
    usersByRole,
    totalProviders,
    providersByStatus,
    totalRoles,
    totalPermissions,
    walletAgg,
    paymentsAgg,
    ratingsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userRole.groupBy({ by: ["roleId"], _count: true }),
    prisma.provider.count(),
    prisma.provider.groupBy({ by: ["status"], _count: true }),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.walletAccount.aggregate({
      _sum: { balance: true },
      _avg: { balance: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.review.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  return {
    // --- Requests ---
    totalRequests,
    openRequests,
    usersInRequests: usersCount,
    providersInRequests: providersCount,
    avgFirstResponseTime,
    completionRate,
    requestsByStatus: byStatus,
    requestsByService: byService,
    monthlyCounts: monthly,

    // --- Users & Providers ---
    totalUsers,
    usersByRole,
    totalProviders,
    providersByStatus,

    // --- RBAC ---
    totalRoles,
    totalPermissions,

    // --- Wallet ---
    totalWalletBalance: walletAgg._sum.balance || 0,
    avgWalletBalance: walletAgg._avg.balance || 0,

    // --- Paiements ---
    payments: {
      totalCount: paymentsAgg._count._all,
      totalAmount: paymentsAgg._sum.amount || 0,
    },

    // --- Ratings ---
    ratings: {
      avgScore: ratingsAgg._avg.rating || 0,
      totalRatings: ratingsAgg._count._all,
    },
  };
}

export default { computeMonthlyCounts, getOverview };
