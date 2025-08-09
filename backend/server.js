// backend/server.js
require('dotenv').config(); // ⬅️ charge .env AVANT toute lecture de process.env

const http = require('http');
const app = require('./app');

const csv = (v) => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
const fromEnv = csv(process.env.ALLOWED_ORIGINS);
const ALLOWED = fromEnv.length ? fromEnv : ['http://localhost:5173']; // ⬅️ vrai fallback si .env absent
const PORT = process.env.PORT || 3000;

// (Optionnel) cron jobs
try { require('./cron/alertScheduler'); } catch { /* no-op en dev */ }

const server = http.createServer(app);

// Socket.io: mêmes origines que l'API (pas de '*')
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ALLOWED,
    credentials: true,
    methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','x-master-key','x-request-id'],
  },
});

// Expose io aux contrôleurs
app.set('io', io);

// Logs socket
io.on('connection', (socket) => {
  console.log(JSON.stringify({
    t: new Date().toISOString(),
    type: 'socket_connect',
    id: socket.id,
    origin: socket.handshake.headers.origin || null
  }));
  socket.on('disconnect', (reason) => {
    console.log(JSON.stringify({
      t: new Date().toISOString(),
      type: 'socket_disconnect',
      id: socket.id,
      reason
    }));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS allowed origins: ${ALLOWED.join(', ')}`);
  console.log(`[BOOT] MASTER_KEY=${process.env.MASTER_KEY} VITE_MASTER_KEY=${process.env.VITE_MASTER_KEY}`);
});

// Arrêt propre
const shutdown = (signal) => () => {
  console.log(`[${signal}] received. Shutting down…`);
  io.close(() => {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
};
process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));
