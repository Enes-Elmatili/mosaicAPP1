// backend/controllers/paymentsController.js
import Stripe from 'stripe';
import { HttpError } from '../middleware/httpError.js';

// Initialiser Stripe avec la clé secrète.
// Assurez-vous que la variable d'environnement STRIPE_SECRET_KEY est définie.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @name createPayment
 * @description Crée une session de paiement Stripe pour une demande de maintenance.
 * @param {object} req - L'objet de requête Express. Attend { requestId, amount } dans req.body.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le middleware suivant.
 */
export const createPayment = async (req, res, next) => {
  try {
    const { requestId, amount } = req.body;

    // Validation de base des données d'entrée
    if (!requestId || !amount || amount <= 0) {
      return next(new HttpError(400, 'L\'ID de la requête et un montant valide sont requis.'));
    }

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Demande de service n° ${requestId}`
          },
          unit_amount: Math.round(amount * 100), // Montant en centimes
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Les URLs de succès et d'annulation doivent être définies dans les variables d'environnement
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      metadata: { 
        requestId 
      },
    });

    // Renvoyer l'URL de la session de paiement au client
    res.status(201).json({ url: session.url });
  } catch (err) {
    console.error('Erreur lors de la création de la session de paiement:', err);
    next(new HttpError(500, 'Erreur interne du serveur lors de la création de la session de paiement.'));
  }
};
