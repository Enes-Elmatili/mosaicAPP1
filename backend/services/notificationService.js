// Service pour envoyer les notifications email aux clients et prestataires
const nodemailer = require('nodemailer');

// Configure le transporteur SMTP via les variables d'environnement
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
 * Envoie un email de notification au client et au prestataire
 * @param {object} requestRecord - Enregistrement complet de la demande
 * @param {object} provider - Infos du prestataire assigné
 * @param {string} contractUrl - URL du contrat PDF généré
 */
async function sendRequestNotification(requestRecord, provider, contractUrl) {
  const clientEmail = requestRecord.clientInfo;
  const providerEmail = provider.email || process.env.DEFAULT_PROVIDER_EMAIL;
  const subject = `Demande de maintenance #${requestRecord.id} enregistrée`;
  const text = `Votre demande a été enregistrée et un prestataire a été assigné.
Consultez le contrat ici : ${contractUrl}`;

  // Envoi au client
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: clientEmail,
    subject,
    text,
  });

  // Envoi au prestataire
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: providerEmail,
    subject: `Nouvelle mission #${requestRecord.id}`,
    text: `Vous avez une nouvelle mission de maintenance.
Consultez le contrat : ${contractUrl}`,
  });
}

/**
 * Envoie une notification d'alerte pour une demande bloquée.
 * @param {object} alertRecord - Alert record (id, requestId, type, timestamp, message)
 * @param {object} requestRecord - MaintenanceRequest complet
 */
async function sendAlertNotification(alertRecord, requestRecord) {
  const clientEmail = requestRecord.clientInfo;
  const providerEmail = requestRecord.providerEmail || process.env.DEFAULT_PROVIDER_EMAIL;
  const adminEmailList = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
  const subject = `Alerte: demande #${alertRecord.requestId} en statut ${requestRecord.status}`;
  const text = `Alerte générée (${alertRecord.type}) à ${alertRecord.timestamp}.
Message: ${alertRecord.message}`;

  // Envoi au client
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: clientEmail, subject, text });
  // Envoi au prestataire
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: providerEmail, subject, text });
  // Envoi aux admins
  if (adminEmailList.length > 0) {
    await transporter.sendMail({ from: process.env.SMTP_FROM, to: adminEmailList, subject, text });
  }
}

module.exports = { sendRequestNotification, sendAlertNotification };
