import React from 'react';

const Partners: React.FC = () => {
  const partners = [
    "Wafa Assurance",
    "BMCE Bank",
    "Attijariwafa Bank", 
    "CDG Capital",
    "LafargeHolcim",
    "ONEE",
    "Managem",
    "OCP Group"
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ils nous font confiance
          </h2>
          <p className="text-gray-600">
            Partenaires et clients de référence au Maroc
          </p>
        </div>
        
        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {partners.map((partner, index) => (
            <div 
              key={index}
              className="text-center opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
              <div className="text-sm font-semibold text-gray-700 px-2 py-4">
                {partner}
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Message */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Nous collaborons avec les acteurs majeurs du secteur immobilier marocain 
            pour vous garantir un service de qualité et une expertise reconnue.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;