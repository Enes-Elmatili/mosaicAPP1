/**
 * Hero.jsx
 * Section d'introduction avec titre, sous-titre et call-to-action.
 */
import { SparklesIcon } from '@heroicons/react/outline';

/**
 * Hero.jsx
 * Section d'introduction avec titre, sous-titre et call-to-action.
 */
export default function Hero() {
  return (
    <section className="bg-primary text-white py-20">
      <div className="container mx-auto text-center px-4">
        <SparklesIcon className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur MOSAÏC</h1>
        <p className="text-lg mb-6">
          Trouvez facilement le prestataire idéal pour vos missions de maintenance.
        </p>
        <a
          href="/search"
          className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full shadow hover:shadow-lg transition"
        >
          Commencer la recherche
        </a>
      </div>
    </section>
  );
}
