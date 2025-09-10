// FAQ data for MOSAÏC homepage
export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Quels types de contrats proposez-vous ?",
    answer: "Nous proposons des contrats de gestion locative flexibles : gestion complète (8-12% des loyers), gestion partielle (5-8%), ou services à la carte. Tous nos contrats sont transparents, sans frais cachés."
  },
  {
    question: "Quels sont vos frais et commissions ?",
    answer: "Commission de 8-12% des loyers encaissés selon le niveau de service. Pas de frais de mise en service, pas de frais cachés. Vous payez uniquement sur les résultats obtenus."
  },
  {
    question: "Dans quelles villes intervenez-vous ?",
    answer: "Nous couvrons Casablanca, Rabat, Marrakech et leurs périphéries. Notre réseau de partenaires qualifiés nous permet d'assurer un service uniforme dans toutes ces zones."
  },
  {
    question: "Quels sont vos délais d'intervention ?",
    answer: "48h maximum pour toute intervention d'urgence. 5-7 jours pour la maintenance préventive. Nous privilégions la réactivité pour préserver vos biens et satisfaire vos locataires."
  },
  {
    question: "Comment fonctionne le reporting ?",
    answer: "Reporting mensuel détaillé via votre espace client : états des lieux, photos, factures, planning maintenance. Alertes temps réel pour toute situation importante."
  },
  {
    question: "Puis-je résilier mon contrat à tout moment ?",
    answer: "Oui, résiliation possible avec préavis de 3 mois. Aucune pénalité si vous respectez le préavis. Nous privilégions la confiance à la contrainte contractuelle."
  }
];