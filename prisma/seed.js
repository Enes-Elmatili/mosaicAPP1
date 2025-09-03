// prisma/seed.js (ESM)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { fakerFR as faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ---- ENV ----------------------------------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mosaic.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SEED_PASSWORD || "mosaic123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

const DEFAULT_CLIENT_EMAIL = "client@mosaic.com";
const DEFAULT_PROVIDER_EMAIL = "provider@mosaic.com";
const DEFAULT_TEST_PASSWORD = process.env.SEED_PASSWORD || "mosaic123!";

// ---- Utils --------------------------------------------------
const slugify = (s) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function upsertRole(name) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name, description: `${name} role` },
  });
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function upsertUserWithRole({ email, name, roleName, phone, password }) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, phone, password: hashed },
    create: {
      email,
      password: hashed,
      name,
      phone,
      userRoles: { create: { role: { connect: { name: roleName } } } },
    },
  });
}

async function main() {
  console.log("🌱 Seeding database…");

  // ---------- ROLES ----------
  await Promise.all(["CLIENT", "PROVIDER", "ADMIN"].map(upsertRole));

  // ---------- Comptes fixes ----------
  const adminUser = await upsertUserWithRole({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    roleName: "ADMIN",
    phone: "0600000001",
    password: ADMIN_PASSWORD,
  });

  const clientUser = await upsertUserWithRole({
    email: DEFAULT_CLIENT_EMAIL,
    name: "Client Démo",
    roleName: "CLIENT",
    phone: "0600000002",
    password: DEFAULT_TEST_PASSWORD,
  });

  const providerUser = await upsertUserWithRole({
    email: DEFAULT_PROVIDER_EMAIL,
    name: "Prestataire Démo",
    roleName: "PROVIDER",
    phone: "0700000003",
    password: DEFAULT_TEST_PASSWORD,
  });

  const providerFixed = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      name: providerUser.name,
      email: providerUser.email,
      phone: providerUser.phone,
      lat: 33.589886, // Casablanca
      lng: -7.603869,
      geohash: "ezs42",
      status: "READY",
      avgRating: 4.7,
      totalRatings: 12,
      totalRequests: 24,
      acceptedRequests: 19,
      declinedRequests: 3,
      avgResponseTimeSec: 120,
      rankScore: 820,
      premium: true,
    },
  });

  const fixedWallet = await prisma.walletAccount.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: { userId: providerUser.id, balance: 50_000 },
  });

  console.log("👤 Comptes fixes:", {
    admin: ADMIN_EMAIL,
    client: DEFAULT_CLIENT_EMAIL,
    provider: DEFAULT_PROVIDER_EMAIL,
    adminPassword: ADMIN_PASSWORD ? "(depuis .env)" : "mosaic123!",
    defaultPassword: DEFAULT_TEST_PASSWORD,
  });

  // ---------- CATEGORIES & SUBCATEGORIES ----------
  const categoriesData = [
    { name: "Plomberie", subs: ["Fuite", "Canalisation", "Robinet"] },
    { name: "Électricité", subs: ["Panne", "Installation", "Court-circuit"] },
    { name: "Nettoyage", subs: ["Ménage", "Vitres", "Jardinage"] },
    { name: "Climatisation", subs: ["Réparation", "Installation"] },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });

    for (const sub of cat.subs) {
      const slug = slugify(sub);
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug } },
        update: {},
        create: { name: sub, slug, categoryId: category.id },
      });
    }
  }

  // ---------- Clients aléatoires ----------
  const clients = [clientUser];
  for (let i = 0; i < 10; i++) {
    const email = faker.internet.email();
    const client = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
        name: faker.person.fullName(),
        phone: faker.phone.number("06########"),
        userRoles: { create: { role: { connect: { name: "CLIENT" } } } },
      },
    });
    clients.push(client);
  }

  // ---------- Subscriptions ----------
  const plans = [
    { planName: "Essentiel", price: 189.99 },
    { planName: "Confort", price: 249.99 },
    { planName: "Premium", price: 349.99 },
    { planName: "All-Inclusive", price: 449.99 },
    { planName: "Himaya Terrain & Lot", price: 449.99 },
  ];

  for (const client of clients) {
    const plan = faker.helpers.arrayElement(plans);

    await prisma.subscription.upsert({
      where: { userId: client.id },
      update: {},
      create: {
        userId: client.id,
        planName: plan.planName,
        price: plan.price,
        status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "CANCELLED"]),
        startDate: faker.date.recent({ days: 60 }),
        endDate: faker.datatype.boolean() ? faker.date.recent({ days: 5 }) : null,
        stripeSubscriptionId: faker.string.uuid(),
      },
    });
  }

  console.log("📦 Subscriptions créées pour", clients.length, "clients");

  // ---------- PERMISSIONS DE BASE ----------
  const permissionsData = [
    { key: "user:create", label: "Créer un utilisateur", description: "Autorise la création d’utilisateurs" },
    { key: "user:read", label: "Lire un utilisateur", description: "Autorise la consultation des utilisateurs" },
    { key: "user:update", label: "Mettre à jour un utilisateur", description: "Autorise la modification des utilisateurs" },
    { key: "user:delete", label: "Supprimer un utilisateur", description: "Autorise la suppression des utilisateurs" },
    { key: "role:manage", label: "Gérer les rôles", description: "Autorise la gestion des rôles" },
    { key: "permission:manage", label: "Gérer les permissions", description: "Autorise la gestion des permissions" },
    { key: "request:manage", label: "Gérer les demandes", description: "Autorise la gestion complète des demandes" }
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  console.log("🔑 Permissions insérées :", permissionsData.map(p => p.key));

  // ---------- Providers aléatoires ----------
  const providers = [providerFixed];
  for (let i = 0; i < 5; i++) {
    const email = faker.internet.email();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10),
        name: faker.person.fullName(),
        phone: faker.phone.number("07########"),
        userRoles: { create: { role: { connect: { name: "PROVIDER" } } } },
      },
    });

    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        lat: Number(faker.location.latitude({ min: 33.5, max: 34 })),
        lng: Number(faker.location.longitude({ min: -7.7, max: -7.5 })),
        geohash: "ezs42",
        status: faker.helpers.arrayElement(["READY", "PAUSED", "OFFLINE"]),
        avgRating: Number(faker.number.float({ min: 3, max: 5, fractionDigits: 2 })),
        totalRatings: randInt(1, 50),
        totalRequests: randInt(5, 100),
        acceptedRequests: randInt(3, 90),
        declinedRequests: randInt(0, 30),
        avgResponseTimeSec: randInt(30, 600),
        rankScore: randInt(200, 900),
        premium: faker.datatype.boolean(),
      },
    });

    await prisma.walletAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: randInt(0, 100_000) },
    });

    providers.push(provider);
  }

  // ---------- Requests ----------
  const allCats = await prisma.category.findMany({ include: { subcategories: true } });
  const reqStatuses = ["PUBLISHED", "ACCEPTED", "DONE", "CANCELLED"];

  for (let i = 0; i < 20; i++) {
    const client = faker.helpers.arrayElement(clients);
    const provider = faker.helpers.arrayElement(providers);
    const cat = faker.helpers.arrayElement(allCats);
    const sub = faker.helpers.arrayElement(cat.subcategories);

    const status = faker.helpers.arrayElement(reqStatuses);
    const providerId = ["ACCEPTED", "DONE"].includes(status) ? provider.id : null;

    await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: cat.id,
        subcategoryId: sub.id,
        serviceType: faker.helpers.arrayElement(["Réparation", "Installation", "Maintenance"]),
        description: faker.lorem.sentence(),
        address: faker.location.streetAddress(),
        lat: Number(faker.location.latitude({ min: 33.5, max: 34 })),
        lng: Number(faker.location.longitude({ min: -7.7, max: -7.5 })),
        geohash: "ezs42",
        status,
        urgent: faker.datatype.boolean(),
        providerId,
        createdAt: faker.date.recent({ days: 20 }),
      },
    });
  }

  // ---------- Messages de test ----------
  for (let i = 0; i < 10; i++) {
    const from = faker.helpers.arrayElement(providers).id;
    const to = faker.helpers.arrayElement(clients).id;
    await prisma.message.create({
      data: {
        from,
        to,
        content: faker.lorem.sentence(),
      },
    });
  }
  console.log("💬 Messages de test insérés");

  // ---------- Transactions Wallet ----------
  for (let i = 0; i < 10; i++) {
    const provider = faker.helpers.arrayElement(providers);
    const account = await prisma.walletAccount.findUnique({
      where: { userId: provider.userId },
    });
    if (!account) continue;

    const amount = randInt(50, 5000);
    const type = faker.helpers.arrayElement(["CREDIT", "DEBIT"]);
    const balanceBefore = account.balance;
    const balanceAfter =
      type === "CREDIT" ? balanceBefore + amount : balanceBefore - amount;

    await prisma.walletTransaction.create({
      data: {
        accountId: account.id,
        amount,
        type,
        balanceBefore,
        balanceAfter,
      },
    });

    await prisma.walletAccount.update({
      where: { id: account.id },
      data: { balance: balanceAfter },
    });
  }
  console.log("💰 Transactions wallet insérées");

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
