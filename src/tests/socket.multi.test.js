// src/test/socket.multi.test.js
import { io } from "socket.io-client";

const URL = "http://localhost:3000";

// Helper pour créer un client provider
function createProvider(providerId) {
  const socket = io(URL, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log(`✅ [${providerId}] connecté avec ID:`, socket.id);

    // Joindre le réseau
    socket.emit("provider:join", { providerId });
    console.log(`➡️ [${providerId}] provider:join envoyé`);
  });

  socket.on("provider:status_update", (data) => {
    console.log(`📡 [${providerId}] reçu status_update:`, data);
  });

  socket.on("new_request", (data) => {
    console.log(`📩 [${providerId}] reçu new_request:`, data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 [${providerId}] déconnecté`);
  });

  return socket;
}

// Créons deux providers simulés
const p1 = createProvider("p1");
const p2 = createProvider("p2");

// Après 3 sec, p1 change son statut
setTimeout(() => {
  console.log("➡️ [p1] provider:set_status BUSY");
  p1.emit("provider:set_status", { providerId: "p1", status: "BUSY" });
}, 3000);

// Après 5 sec, envoie une requête ciblée à p2
setTimeout(() => {
  console.log("➡️ [TEST] new_request envoyé pour p2");
  p1.emit("new_request", { requestId: "r42", providerId: "p2" });
}, 5000);

// Après 10 sec, on ferme proprement
setTimeout(() => {
  console.log("🛑 Fermeture des tests");
  p1.disconnect();
  p2.disconnect();
  process.exit(0);
}, 10000);
