import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ajout
import app from "./app.js"; // 👈 on réutilise ton app configurée
import prisma from "./db/prisma.js";

dotenv.config();

// ────────────── PATCH CORS EXPRESS ──────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL, // en prod si défini
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // autorise Postman / curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ────────────── HTTP + SOCKET.IO ──────────────
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by Socket.IO CORS: " + origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ────────────── SOCKET.IO ──────────────
const providerSockets = new Map();

io.on("connection", (socket) => {
  console.log(`[SOCKET] ${socket.id} connected`);

  // 👉 provider:join
  socket.on("provider:join", async ({ providerId }) => {
    providerSockets.set(providerId, socket.id);
    console.log(`[PROVIDER] ${providerId} joined`);

    try {
      await prisma.provider.update({
        where: { id: providerId },
        data: { status: "READY" },
      });

      // 🔥 broadcast à tous
      io.emit("provider:status_update", { providerId, status: "READY" });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  });

  // 👉 provider:set_status
  socket.on("provider:set_status", async ({ providerId, status }) => {
    console.log(`[STATUS] ${providerId} → ${status}`);

    try {
      await prisma.provider.update({
        where: { id: providerId },
        data: { status },
      });

      // 🔥 broadcast à tous
      io.emit("provider:status_update", { providerId, status });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  });

  // 👉 new_request
  socket.on("new_request", async ({ requestId, providerId }) => {
    console.log(`[REQUEST] New request ${requestId} → provider ${providerId}`);

    const targetSocket = providerSockets.get(providerId);
    if (targetSocket) {
      // 🔥 envoyer seulement au provider ciblé
      io.to(targetSocket).emit("new_request", { requestId });
    } else {
      console.warn(`[REQUEST] Provider ${providerId} non connecté`);
    }
  });

  // 👉 disconnect
  socket.on("disconnect", async () => {
    const providerId = [...providerSockets.entries()].find(
      ([, sid]) => sid === socket.id
    )?.[0];

    if (providerId) {
      providerSockets.delete(providerId);
      console.log(`[DISCONNECT] ${providerId} disconnected`);

      try {
        await prisma.provider.update({
          where: { id: providerId },
          data: { status: "OFFLINE" },
        });

        // 🔥 broadcast à tous
        io.emit("provider:status_update", { providerId, status: "OFFLINE" });
      } catch (err) {
        console.error("Error updating disconnect:", err);
      }
    }
  });
});

// ────────────── LANCEMENT ──────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export { io, server };
