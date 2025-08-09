import React from 'react';

/**
 * Preuves section: quick trust indicators for landing page.
 */
const Preuves: React.FC = () => (
  <section className="bg-white py-16">
    <div className="container mx-auto px-6 text-center space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Ils nous font confiance</h2>
      <div className="flex flex-col sm:flex-row justify-center gap-6 text-gray-700 text-lg">
        <span>Confiance de propriétaires au Maroc et MRE.</span>
        <span>92&nbsp;% de satisfaction sur la bêta (50 testeurs).</span>
      </div>
    </div>
  </section>
);

export default Preuves;
