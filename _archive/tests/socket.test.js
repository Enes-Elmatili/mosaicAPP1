// tests/socket.test.js
import { io } from "socket.io-client";

const URL = "http://localhost:3000";
const socket = io(URL, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Connecté au serveur avec ID:", socket.id);

  socket.emit("provider:join", { providerId: "p1" });
  console.log("➡️ Event provider:join envoyé");

  setTimeout(() => {
    socket.emit("provider:set_status", { providerId: "p1", status: "READY" });
    console.log("➡️ Event provider:set_status envoyé");
  }, 2000);

  setTimeout(() => {
    socket.emit("new_request", { requestId: "r1", providerId: "p1" });
    console.log("➡️ Event new_request envoyé");
  }, 4000);
});

socket.on("provider:status_update", (data) => {
  console.log("📡 provider:status_update reçu:", data);
});

socket.on("connect_error", (err) => {
  console.error("❌ Erreur de connexion:", err.message);
});

socket.on("disconnect", () => {
  console.log("🔌 Déconnecté du serveur");
});
