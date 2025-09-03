// backend/services/notificationService.js
import nodemailer from 'nodemailer';

// Configure le transporteur SMTP via les variables d'environnement.
// Assurez-vous que ces variables sont définies dans votre fichier .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * @name sendMail
 * @description Fonction utilitaire pour envoyer un email et gérer les erreurs.
 * @param {object} mailOptions - Options de l'email (to, subject, text, from).
 */
const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail({
      ...mailOptions,
      from: process.env.SMTP_FROM || 'noreply@yourdomain.com'
    });
    console.log('Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

/**
 * @name sendRequestNotification
 * @description Envoie un email de notification au client et au prestataire.
 * @param {object} requestRecord - Enregistrement complet de la demande.
 * @param {object} provider - Infos du prestataire assigné.
 * @param {string} contractUrl - URL du contrat PDF généré.
 */
export const sendRequestNotification = async (requestRecord, provider, contractUrl) => {
  const clientEmail = requestRecord.clientInfo;
  const providerEmail = provider.email || process.env.DEFAULT_PROVIDER_EMAIL;

  // Envoi au client
  await sendMail({
    to: clientEmail,
    subject: `Demande de maintenance #${requestRecord.id} enregistrée`,
    text: `Bonjour, votre demande a été enregistrée et un prestataire a été assigné.
Consultez le contrat ici : ${contractUrl}`,
  });

  // Envoi au prestataire
  await sendMail({
    to: providerEmail,
    subject: `Nouvelle mission #${requestRecord.id}`,
    text: `Bonjour, vous avez une nouvelle mission de maintenance.
Consultez le contrat : ${contractUrl}`,
  });
};

/**
 * @name sendAlertNotification
 * @description Envoie une notification d'alerte pour une demande bloquée.
 * @param {object} alertRecord - Enregistrement d'alerte (id, requestId, type, timestamp, message).
 * @param {object} requestRecord - Enregistrement complet de la demande.
 */
export const sendAlertNotification = async (alertRecord, requestRecord) => {
  const clientEmail = requestRecord.clientInfo;
  const providerEmail = requestRecord.providerEmail || process.env.DEFAULT_PROVIDER_EMAIL;
  const adminEmailList = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
  
  const subject = `Alerte: demande #${alertRecord.requestId} en statut ${requestRecord.status}`;
  const text = `Alerte générée (${alertRecord.type}) à ${alertRecord.timestamp}.
Message: ${alertRecord.message}`;

  // Envoi au client
  await sendMail({ to: clientEmail, subject, text });
  
  // Envoi au prestataire
  await sendMail({ to: providerEmail, subject, text });
  
  // Envoi aux admins
  if (adminEmailList.length > 0) {
    await sendMail({ to: adminEmailList, subject, text });
  }
};
