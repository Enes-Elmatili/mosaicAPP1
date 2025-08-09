/**
 * Pricing.jsx
 * Page détaillant les tarifs individuels et packs.
 */
import Layout from '../components/Layout';

export default function Pricing() {
  const items = [
    { label: 'Demande unique', price: '5€', desc: 'Payer à la demande' },
    { label: 'Pack 5 demandes', price: '20€', desc: '4€ par demande' },
    { label: 'Pack 10 demandes', price: '35€', desc: '3.5€ par demande' },
  ];
  return (
    <Layout>
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Nos Tarifs</h1>
        <p className="text-gray-600 mb-8">
          Des formules flexibles pour tous vos besoins, à partir d’une seule demande.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((i) => (
            <div key={i.label} className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-2xl font-semibold mb-2">{i.label}</h2>
              <p className="text-xl text-primary mb-2">{i.price}</p>
              <p className="text-gray-500 mb-4">{i.desc}</p>
              <button className="bg-primary text-white py-2 px-4 rounded-full hover:bg-opacity-90">
                Sélectionner
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
