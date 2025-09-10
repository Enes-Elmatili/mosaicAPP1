import React from 'react';
import { kpis } from '../data/kpis';

const KPIs: React.FC = () => {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nos résultats parlent d'eux-mêmes
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            La confiance de nos clients se mesure en chiffres
          </p>
        </div>
        
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {kpis.map((kpi, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {kpi.value}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {kpi.label}
                </div>
                <div className="text-sm text-blue-100">
                  {kpi.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom Message */}
        <div className="text-center mt-12">
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Ces chiffres reflètent notre engagement quotidien envers l'excellence. 
            Chaque propriétaire bénéficie de notre expertise et de notre réseau de confiance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default KPIs;