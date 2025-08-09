import React from 'react';
import { Link } from 'react-router-dom';

interface Plan {
  title: string;
  price: string;
  details: string[];
}

const plans: Plan[] = [
  {
    title: 'Essentiel',
    price: '249,99 € / mois',
    details: [
      'Encaissement des loyers & suivi des paiements',
      'États des lieux basiques',
      'Espace client web/app (forfait, sans frais cachés)',
    ],
  },
  {
    title: 'Confort',
    price: '349,99 € / mois',
    details: [
      'Tout Essentiel',
      'Travaux légers inclus, relocation & remise en état',
      'Gestion administrative complète',
    ],
  },
  {
    title: 'All-Inclusive',
    price: '449,99 € / mois',
    details: [
      'Tout Confort',
      'Concierge 24/7 (aide locataires)',
      'Entretien paysager & gestion d’événements ponctuels',
    ],
  },
];

const Pricing: React.FC = () => (
  <section className="bg-gray-50 py-16">
    <div className="container mx-auto px-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-12">
        Nos formules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {plans.map(({ title, price, details }) => (
          <div
            key={title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200 flex flex-col"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-2xl font-semibold text-primary-600 mb-4">{price}</p>
            <ul className="flex-1 list-disc list-inside text-gray-700 space-y-2 mb-4">
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <Link
              to="#"
              className="mt-auto bg-primary-600 text-white text-center py-3 rounded hover:bg-primary-700 transition duration-200"
            >
              Choisir
            </Link>
          </div>
        ))}
      </div>
      <div className="bg-white border-l-4 border-primary-500 p-6 mb-8 rounded">
        <p className="text-gray-800">
          Les abonnements MOSAÏC sont déductibles du revenu foncier imposable.<br />
          Bénéficiez d’une réduction effective de l’assiette fiscale jusqu’à 30–35 % du coût de l’abonnement (selon régime).
        </p>
      </div>
      <div className="text-center">
        <Link to="/pricing" className="text-primary-600 hover:underline font-medium">
          Voir toutes les formules
        </Link>
      </div>
    </div>
  </section>
);

export default Pricing;
