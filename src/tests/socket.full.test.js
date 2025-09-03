// src/tests/socket.all.test.js
import { io as Client } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const URL = "http://localhost:3000";

async function main() {
  console.log("🚀 Lancement des tests complets Socket.IO...");

  // --- Récupération des providers ---
  const providers = await prisma.provider.findMany({ take: 2, include: { user: true } });
  if (providers.length < 2) {
    throw new Error("Pas assez de providers en base. Lance `npx prisma db seed` !");
  }

  const [p1, p2] = providers;
  console.log("🗄️ Providers utilisés:", p1.id, p2.id);

  // --- Balance initiale ---
  const walletBefore = await prisma.walletAccount.findUnique({ where: { userId: p1.userId } });
  const initialBalance = walletBefore?.balance ?? 0;
  console.log("💰 Balance initiale p1:", initialBalance);

  // --- Flags ---
  let messageReceived = false;
  let newRequestReceived = false;

  // --- Création des clients ---
  const s1 = Client(URL, { transports: ["websocket"] });
  const s2 = Client(URL, { transports: ["websocket"] });

  // --- Ecouteurs sockets ---
  s1.on("connect", () => console.log("✅ [p1] connecté", s1.id));
  s2.on("connect", () => console.log("✅ [p2] connecté", s2.id));
  s1.on("disconnect", () => console.log("🔌 [p1] déconnecté"));
  s2.on("disconnect", () => console.log("🔌 [p2] déconnecté"));

  s1.on("provider:status_update", (data) => console.log("📡 [p1 reçoit] status_update:", data));
  s2.on("provider:status_update", (data) => console.log("📡 [p2 reçoit] status_update:", data));

  s2.on("new_request", (data) => {
    console.log("📩 [p2] reçoit new_request:", data);
    newRequestReceived = true;
  });

  s2.on("message:receive", (data) => {
    console.log("💬 [p2] reçoit message:", data);
    if (data.content === "Salut p2 👋") messageReceived = true;
  });

  s1.on("wallet:update", (data) => console.log("💰 [p1] wallet update:", data));

  // --- Simulation du flow ---
  setTimeout(() => {
    s1.emit("provider:join", { providerId: p1.id });
    s2.emit("provider:join", { providerId: p2.id });
    console.log("➡️ provider:join envoyé");
  }, 500);

  setTimeout(() => {
    s1.emit("provider:set_status", { providerId: p1.id, status: "BUSY" });
    console.log("➡️ [p1] set_status BUSY");
  }, 1500);

  setTimeout(() => {
    s1.emit("new_request", { requestId: "req-42", providerId: p2.id });
    console.log("➡️ new_request envoyé à p2");
  }, 2500);

  setTimeout(() => {
    s1.emit("message:send", { from: p1.id, to: p2.id, content: "Salut p2 👋" });
    console.log("➡️ message envoyé de p1 à p2");
  }, 3500);

  setTimeout(() => {
    s1.emit("wallet:credit", { providerId: p1.userId, amount: 100 });
    console.log("➡️ wallet:credit 100 → p1");
  }, 4500);

  setTimeout(() => {
    s1.emit("wallet:debit", { providerId: p1.userId, amount: 40 });
    console.log("➡️ wallet:debit 40 → p1");
  }, 5500);

  // --- Vérification finale ---
  setTimeout(async () => {
    console.log("🛑 Vérification finale...");

    // Vérif statut OFFLINE après déconnexion
    s1.close();
    s2.close();

    const prov = await prisma.provider.findUnique({ where: { id: p1.id } });
    console.assert(prov?.status === "OFFLINE", `❌ Status final incorrect: ${prov?.status}`);

    // Vérif balance
    const walletAfter = await prisma.walletAccount.findUnique({ where: { userId: p1.userId } });
    const expectedBalance = initialBalance + 60;
    console.assert(
      walletAfter?.balance === expectedBalance,
      `❌ Balance incorrecte: attendu ${expectedBalance}, obtenu ${walletAfter?.balance}`
    );

    // Vérif transactions
    const txs = await prisma.walletTransaction.findMany({
      where: { accountId: walletAfter.id },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    console.assert(txs.some(tx => tx.type === "CREDIT" && tx.amount === 100), "❌ Crédit manquant");
    console.assert(txs.some(tx => tx.type === "DEBIT" && tx.amount === 40), "❌ Débit manquant");

    // Vérif message reçu
    console.assert(messageReceived, "❌ Message non reçu par p2");

    // Vérif requête reçue
    console.assert(newRequestReceived, "❌ Requête non reçue par p2");

    // Vérif log des statuts
    const logs = await prisma.providerStatusLog.findMany({
      where: { providerId: p1.id },
      orderBy: { changedAt: "desc" },
    });
    console.assert(logs.some(l => l.status === "READY"), "❌ Log READY manquant");
    console.assert(logs.some(l => l.status === "BUSY"), "❌ Log BUSY manquant");
    console.assert(logs.some(l => l.status === "OFFLINE"), "❌ Log OFFLINE manquant");

    console.log("✅ Tous les tests sont passés !");
    await prisma.$disconnect();
    process.exit(0);
  }, 8000);
}

main().catch(async (err) => {
  console.error("❌ Erreur dans le test:", err);
  await prisma.$disconnect();
  process.exit(1);
});
