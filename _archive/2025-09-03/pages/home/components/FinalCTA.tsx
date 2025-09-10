import React from 'react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à professionnaliser 
            <br />
            votre gestion immobilière ?
          </h2>
          
          {/* Subheading */}
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez MOSAÏC et transformez vos investissements immobiliers 
            en sources de revenus optimisées et sereines.
          </p>
          
          {/* Benefits List */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-blue-100">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Évaluation gratuite
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Mise en service rapide
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Support dédié
            </span>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              Voir nos tarifs
            </a>
            <a 
              href="/offers"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              Découvrir nos offres
            </a>
          </div>
          
          {/* Trust Message */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 text-sm">
              Contrat flexible • Sans engagement long terme • Tarification transparente
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;