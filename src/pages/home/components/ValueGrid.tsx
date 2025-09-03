import React from 'react';
import { HomeIcon, WrenchIcon, ShieldIcon, ChartIcon } from './Icons';

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ValueGrid: React.FC = () => {
  const values: ValueCard[] = [
    {
      icon: <HomeIcon className="text-blue-600" size={32} />,
      title: "Gestion locative 360°",
      description: "De la recherche locataire au suivi quotidien",
      features: ["Sélection locataires", "Encaissement loyers", "États des lieux", "Contentieux"]
    },
    {
      icon: <WrenchIcon className="text-green-600" size={32} />,
      title: "Maintenance fiable",
      description: "Interventions rapides par nos partenaires qualifiés",
      features: ["Urgences 24h/24", "Maintenance préventive", "Réseau certifié", "Suivi qualité"]
    },
    {
      icon: <ShieldIcon className="text-purple-600" size={32} />,
      title: "Conciergerie premium",
      description: "Services haut de gamme pour vos locataires",
      features: ["Accueil personnalisé", "Services quotidiens", "Assistance 7j/7", "Expérience premium"]
    },
    {
      icon: <ChartIcon className="text-orange-600" size={32} />,
      title: "Location saisonnière",
      description: "Optimisation des revenus sur plateformes",
      features: ["Multi-plateformes", "Pricing dynamique", "Gestion réservations", "Nettoyage pro"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos services d'excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une approche complète et professionnelle pour maximiser vos revenus locatifs
          </p>
        </div>
        
        {/* Value Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Icon */}
              <div className="mb-6">
                {value.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {value.description}
              </p>
              
              {/* Features List */}
              <ul className="space-y-2">
                {value.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueGrid;