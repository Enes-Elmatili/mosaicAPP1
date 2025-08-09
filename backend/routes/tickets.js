// Tickets router: ticket management endpoints
const express = require('express');
const router = express.Router();

// GET /tickets - basic check endpoint
router.get('/', (req, res) => {
  res.json({ msg: 'tickets route OK' });
});

module.exports = router;
