// Contracts router: contract management endpoints
const express = require('express');
const router = express.Router();

// GET /contracts - basic check endpoint
router.get('/', (req, res) => {
  res.json({ msg: 'contracts route OK' });
});

module.exports = router;
