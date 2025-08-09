import React from 'react';

/**
 * FAQ section for the landing page.
 */
const faqs: { question: string; answer: string }[] = [
  {
    question: "Comment se passe l’onboarding ?",
    answer:
      "En 24–48 h : import de vos biens/locataires, paramétrage des loyers et accès à votre tableau de bord.",
  },
  {
    question: 'Puis-je résilier à tout moment ?',
    answer:
      "Oui. Sans engagement : arrêt à la fin du mois en cours et export de vos données.",
  },
  {
    question: 'Comment gérez-vous les impayés ?',
    answer:
      "Relances automatiques + suivi en temps réel. Option Himaya pour renforcer la protection contre les impayés.",
  },
  {
    question: 'Qui s’occupe des interventions ?',
    answer:
      "Notre réseau de prestataires vérifiés. Devis validés par le propriétaire, exécution tracée avec photos et journal d’action.",
  },
  {
    question: 'Proposez-vous un accompagnement juridique / notarial ?',
    answer:
      "Oui. Dossiers centralisés, modèles de documents et partage sécurisé avec les notaires partenaires.",
  },
  {
    question: 'Mes données sont-elles en sécurité ?',
    answer:
      "Oui. Chiffrement, sauvegardes régulières, accès par rôles et journalisation. Conformité RGPD.",
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer:
      "CB / virement / SEPA (selon disponibilité). Reçus automatiques et export comptable inclus.",
  },
  {
    question: "L’application fonctionne-t-elle sur mobile et hors-ligne ?",
    answer:
      "Oui. Web-app installable (PWA), chargement du shell hors-ligne et notifications. Accès fluide sur iOS et Android.",
  },
];

const FAQ: React.FC = () => (
  <section className="bg-white py-16">
    <div className="container mx-auto px-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-12">
        FAQ
      </h2>
      <div className="space-y-6 max-w-3xl mx-auto">
        {faqs.map(({ question, answer }) => (
          <div key={question}>
            <p className="font-medium text-gray-800">{question}</p>
            <p className="mt-2 text-gray-600">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
