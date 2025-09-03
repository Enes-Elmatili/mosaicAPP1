import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image + Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1539650116574-75c0c6d73469?w=1920&q=80"
          alt="Architecture marocaine moderne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto animate-fadeIn">
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium animate-slideUp">
            Propriétaires & Expatriés
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium animate-slideUp delay-150">
            Maroc • 2025
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
          Réinventons la gestion
          <br />
          <span className="bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent">
            immobilière au Maroc
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
          Sécurité, transparence et performance pour vos investissements
          immobiliers. Gestion complète de vos biens avec la technologie de
          demain.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/offers"
            className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-lg text-white bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink shadow-lg hover:opacity-90 active:scale-[.98] transition-all duration-300"
          >
            Découvrir nos offres
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-300">
            <span className="animate-slideUp">✓ 350+ biens gérés</span>
            <span className="animate-slideUp delay-150">
              ✓ 97% satisfaction client
            </span>
            <span className="animate-slideUp delay-300">✓ Intervention 48h</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
