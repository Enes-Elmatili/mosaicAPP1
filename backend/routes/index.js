// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Pings
router.get('/', (req, res) => res.json({ status: 'MOSAIC API up' }));
router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Sous-routeurs
router.use('/auth',          require('./auth'));
router.use('/admin',         require('./admin'));         // <-- n'oublie pas ce montage
router.use('/subscription',  require('./subscription'));
router.use('/contracts',     require('./contracts'));
router.use('/tickets',       require('./tickets'));
router.use('/notifications', require('./notifications'));
router.use('/requests',      require('./requests'));
router.use('/payments',      require('./payments'));
router.use('/uploads',       require('./uploads'));

// 404 API
router.use((req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = router;
