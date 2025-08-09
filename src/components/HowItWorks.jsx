/**
 * HowItWorks.jsx
 * Section décrivant les étapes de fonctionnement en 3 blocs.
 */
/**
 * HowItWorks.jsx
 * Section décrivant les étapes de fonctionnement en 3 blocs.
 */
export default function HowItWorks() {
  const steps = [
    { title: 'Étape 1', desc: 'Décrivez votre mission en quelques clics.' },
    { title: 'Étape 2', desc: 'Recevez des offres de plusieurs prestataires.' },
    { title: 'Étape 3', desc: 'Choisissez et confirmez votre prestataire.' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
