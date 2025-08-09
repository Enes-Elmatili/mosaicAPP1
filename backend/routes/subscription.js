// Subscription router: subscription-related endpoints
const express = require('express');
const router = express.Router();

// GET /subscription - basic check endpoint
router.get('/', (req, res) => {
  res.json({ msg: 'subscription route OK' });
});

module.exports = router;
