/**
 * Plans.jsx
 * Page présentant les offres et abonnements disponibles.
 */
import Layout from '../components/Layout';

export default function Plans() {
  const plans = [
    {
      name: 'Essentiel',
      price: 'Gratuit',
      features: ['Recherche basique', 'Support communauté'],
    },
    {
      name: 'Pro',
      price: '19€/mois',
      features: ['Recherche avancée', 'Support prioritaire', 'Statistiques'],
    },
    {
      name: 'Entreprise',
      price: 'Sur devis',
      features: ['Tout inclus', 'Compte multi-utilisateurs', 'SLA garanti'],
    },
  ];
  return (
    <Layout>
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Offres & Abonnements</h1>
        <p className="text-gray-600 mb-8">
          Choisissez la formule la plus adaptée à vos besoins et profitez d’avantages exclusifs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-xl text-primary mb-4">{plan.price}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-primary text-white py-2 rounded-full hover:bg-opacity-90">
                Choisir {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
