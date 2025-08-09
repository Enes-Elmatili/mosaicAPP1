// Payments router: create Stripe payment sessions for maintenance requests
const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentsController');

/**
 * POST /payments - initiate a Stripe Checkout session
 */
router.post('/', createPayment);

module.exports = router;
