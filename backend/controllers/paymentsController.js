// Controller to handle Stripe payment sessions for maintenance requests
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout session for a maintenance request payment.
 * Expects { requestId, amount } in req.body (amount in euros).
 */
async function createPayment(req, res, next) {
  try {
    const { requestId, amount } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Service Request #${requestId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      metadata: { requestId },
    });
    res.status(201).json({ url: session.url });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPayment };
