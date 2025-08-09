// Notifications router: notifications management endpoints
const express = require('express');
const router = express.Router();

// GET /notifications - basic check endpoint
router.get('/', (req, res) => {
  res.json({ msg: 'notifications route OK' });
});

module.exports = router;
