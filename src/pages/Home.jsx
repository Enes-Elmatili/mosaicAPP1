/**
 * Home.jsx
 * Page d'accueil avec sections Hero, Comment ça marche et Témoignages.
 */
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <Layout>
      <section className="pt-24 bg-white">
        {/* Titre principal */}
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenue sur MOSAÏC</h1>
          <p className="text-lg text-gray-600 mb-8">
            Votre plateforme pour trouver les meilleurs prestataires de maintenance près de chez vous.
          </p>
          {/* Image d'illustration (personnaliser src/alt) */}
          <img
            src="https://placehold.co/600x400"
            alt="Illustration de la plateforme"
            className="mx-auto rounded-lg shadow mb-8"
          />
          {/* Call-to-action */}
          <a
            href="/search"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition"
          >
            Commencer la recherche
          </a>
        </div>
      </section>
      {/* Section Comment ça marche */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Décrivez votre besoin', 'Recevez des offres', 'Choisissez un prestataire'].map(
              (step, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">Étape {idx + 1}</h3>
                  <p>{step}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
      {/* Section Témoignages */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ils nous font confiance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Alice Dupont', quote: 'Service rapide et professionnel.' },
              { name: 'Jean Martin', quote: 'Très bon rapport qualité/prix.' },
              { name: 'Sophie Bernard', quote: 'Plateforme facile à utiliser.' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <p className="italic mb-4">“{t.quote}”</p>
                <p className="font-semibold text-right">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer déjà inclus via Layout */}
    </Layout>
  );
}
