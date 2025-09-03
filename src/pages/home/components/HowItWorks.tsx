import React from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  detail: string;
}

const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      number: "01",
      title: "Décrire le bien",
      description: "Évaluation gratuite de votre propriété",
      detail: "Photos, visite, estimation locative et stratégie personnalisée"
    },
    {
      number: "02", 
      title: "Onboarding digital",
      description: "Mise en ligne et processus simplifié",
      detail: "Contrat digital, documents légaux et mise sur le marché"
    },
    {
      number: "03",
      title: "Gestion & interventions", 
      description: "Suivi quotidien de votre investissement",
      detail: "Recherche locataire, maintenance, encaissements, relation client"
    },
    {
      number: "04",
      title: "Reporting temps réel",
      description: "Transparence totale sur vos revenus",
      detail: "Dashboard personnel, rapports mensuels et alertes importantes"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un processus simple et transparent en 4 étapes
          </p>
        </div>
        
        {/* Steps Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                
                {/* Step Content */}
                <div className="ml-16">
                  <p className="text-lg text-gray-700 mb-2 font-medium">
                    {step.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
                
                {/* Connector Line (except for last items) */}
                {(index < 2 || (index === 2 && steps.length === 4)) && (
                  <div className="hidden md:block absolute top-6 left-6 w-px h-20 bg-gray-200 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h3>
            <p className="text-gray-600 mb-6">
              Rejoignez les 350+ propriétaires qui nous font confiance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                Commencer maintenant
              </a>
              <a 
                href="/login"
                className="inline-flex items-center px-6 py-3 text-blue-600 border border-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300"
              >
                Déjà client ?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;