import React from 'react';
import PageWrapper from '../../components/Layout/PageWrapper';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const OffersPage: React.FC = () => {
  const offers = [
    {
      name: "Gratuite",
      price: "0 MAD",
      period: "/mois",
      description: "Accédez gratuitement à l’application MOSAÏC et suivez votre bien en toute autonomie.",
      features: [
        "Accès illimité à l’application",
        "Tableaux de bord en temps réel",
        "Support par email",
      ],
      cta: "Créer un compte gratuit",
      ctaLink: "/signup",
      highlight: false,
    },
    {
      name: "Essentiel",
      price: "449 MAD",
      period: "/mois",
      description: "L’essentiel pour sécuriser vos revenus locatifs et assurer un suivi rigoureux.",
      features: [
        "Gestion des loyers",
        "États des lieux complets",
        "Support prioritaire",
        "Reporting mensuel détaillé",
      ],
      cta: "Choisir Essentiel",
      ctaLink: "/signup",
      highlight: true,
    },
    {
      name: "Confort",
      price: "699 MAD",
      period: "/mois",
      description: "L’offre premium pour une tranquillité totale et une rentabilité optimisée.",
      features: [
        "Tout le pack Essentiel",
        "Conciergerie premium",
        "Maintenance illimitée",
        "Optimisation du taux d’occupation",
        "Suivi fiscal & juridique",
      ],
      cta: "Opter pour Confort",
      ctaLink: "/signup",
      highlight: false,
    },
  ];

  return (
    <PageWrapper title="">
      <section className="relative py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* SEO Title */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Nos Offres & Abonnements
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez la formule qui correspond à vos besoins, de l'accès gratuit à l'application jusqu'au service tout inclus.
            </p>
          </header>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.name}
                className={`relative flex flex-col rounded-3xl border p-6 shadow-sm transition hover:shadow-lg bg-white ${
                  offer.highlight ? "border-blue-600 shadow-md" : "border-gray-200"
                }`}
              >
                {offer.highlight && (
                  <span className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Populaire
                  </span>
                )}
                <h2 className="text-2xl font-bold mb-2">{offer.name}</h2>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{offer.price}</span>
                  <span className="text-gray-500">{offer.period}</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-blue-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={offer.ctaLink}
                  className={`mt-6 inline-block rounded-full px-6 py-3 font-semibold text-center transition ${
                    offer.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {offer.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Vous hésitez encore ?</h2>
            <p className="text-gray-600 mb-6">
              Contactez notre équipe pour obtenir une recommandation adaptée à vos besoins.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-blue-600 text-white px-6 py-3 font-semibold transition hover:bg-blue-700"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default OffersPage;
