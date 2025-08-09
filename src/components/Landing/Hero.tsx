import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Hero section for the premium landing page.
 */
const Hero: React.FC = () => (
  <section className="relative bg-gradient-to-r from-primary-500 to-accent-500 text-white">
    {/* Top notice */}
    <div className="bg-white bg-opacity-20 text-center text-sm py-2">
      Nouveau : option de protection des loyers <strong>Himaya</strong> désormais disponible.
    </div>
    <div className="container mx-auto px-6 py-16 flex flex-col-reverse lg:flex-row items-center gap-12">
      <div className="w-full lg:w-1/2 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">
          La gestion locative premium, clé en main.
        </h1>
        <p className="text-lg md:text-xl max-w-prose">
          Plateforme élégante + équipe terrain pour propriétaires exigeants. Encaissement des loyers, interventions, documents et reporting — tout au même endroit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="#"
            className="bg-white text-primary-600 font-medium py-3 px-6 rounded shadow hover:shadow-lg transition duration-200"
          >
            Essayer gratuitement
          </Link>
          <Link
            to="#"
            className="border border-white font-medium py-3 px-6 rounded hover:bg-white hover:bg-opacity-20 transition duration-200"
          >
            Parler à un expert
          </Link>
        </div>
        <p className="text-sm opacity-90">Sans engagement. Mise en place en quelques minutes.</p>
        <div className="flex flex-wrap gap-2 text-sm opacity-90">
          <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full">
            Suivi des loyers en temps réel
          </span>
          <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full">
            Tickets & interventions avec photos
          </span>
          <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full">
            Tableau de bord propriétaire
          </span>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex justify-center">
        <img
          src="/hero-image.png"
          alt="Aperçu de l’application de gestion locative : loyers, interventions et documents visibles sur un tableau de bord."
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </div>
    </div>
  </section>
);

export default Hero;
