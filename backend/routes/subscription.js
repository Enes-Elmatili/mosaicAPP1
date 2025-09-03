// backend/routes/subscription.js (ESM)
import express, { raw } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import HttpError from "../middleware/httpError.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import validate from "../middleware/validate.js";
import Stripe from "stripe";

const router = express.Router();
const { validateBody, validateParams } = validate;

// Initialiser Stripe avec clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// ------------------- 🔹 SCHEMAS -------------------
const SubscriptionIdSchema = z.object({
  id: z.string().uuid(),
});

const SubscriptionCreateSchema = z.object({
  planName: z.string().min(3),
  price: z.number().positive(),
});

const SubscriptionUpdateSchema = z.object({
  planName: z.string().min(3).optional(),
  price: z.number().positive().optional(),
});

const CreateCheckoutSessionSchema = z.object({
  priceId: z.string().min(1), // ID du plan Stripe
  userId: z.string().uuid(),
});

// ------------------- 🔹 ROUTES CRUD -------------------

// GET /subscription - toutes les souscriptions de l'utilisateur
router.get("/", authenticateFlexible, async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.userId },
    });
    res.json(subscriptions);
  } catch (error) {
    next(HttpError.internal("Failed to fetch subscriptions", { cause: error }));
  }
});

// GET /subscription/:id - une souscription par ID
router.get(
  "/:id",
  authenticateFlexible,
  validateParams(SubscriptionIdSchema),
  async (req, res, next) => {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { id: req.params.id, userId: req.userId },
      });

      if (!subscription) throw HttpError.notFound("Subscription not found");

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }
);

// POST /subscription - création manuelle (admin ou fallback)
router.post(
  "/",
  authenticateFlexible,
  validateBody(SubscriptionCreateSchema),
  async (req, res, next) => {
    try {
      const { planName, price } = req.body;
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: req.userId,
          planName,
          price,
          startDate: new Date(),
          status: "PENDING",
        },
      });
      res.status(201).json(newSubscription);
    } catch (error) {
      next(HttpError.internal("Failed to create subscription", { cause: error }));
    }
  }
);

// PUT /subscription/:id - mise à jour
router.put(
  "/:id",
  authenticateFlexible,
  validateParams(SubscriptionIdSchema),
  validateBody(SubscriptionUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.subscription.updateMany({
        where: { id, userId: req.userId },
        data: req.body,
      });

      if (updated.count === 0)
        throw HttpError.notFound("Subscription not found or not yours");

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /subscription/:id
router.delete(
  "/:id",
  authenticateFlexible,
  validateParams(SubscriptionIdSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const deleted = await prisma.subscription.deleteMany({
        where: { id, userId: req.userId },
      });

      if (deleted.count === 0)
        throw HttpError.notFound("Subscription not found or not yours");

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// ------------------- 🔹 STRIPE -------------------

// POST /subscription/create-checkout-session
router.post(
  "/create-checkout-session",
  authenticateFlexible,
  validateBody(CreateCheckoutSessionSchema),
  async (req, res, next) => {
    try {
      const { priceId, userId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: { userId },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      next(HttpError.internal("Stripe checkout session failed", { cause: error }));
    }
  }
);

// POST /subscription/webhook - Stripe webhook listener
router.post("/webhook", raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.userId;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription,
            startDate: new Date(),
          },
          create: {
            userId,
            planName: "Default Plan", // à raffiner avec Stripe Product
            price: 0,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription,
            startDate: new Date(),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED", endDate: new Date() },
        });
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handling failed:", error);
    res.status(500).json({ error: "Webhook handling failed" });
  }
});

export default router;
