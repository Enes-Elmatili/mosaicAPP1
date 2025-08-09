/**
 * Search.jsx
 * Page de recherche de prestataires selon critères.
 */
import Layout from '../components/Layout';

export default function Search() {
  return (
    <Layout>
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Rechercher un prestataire</h1>
        <p className="text-gray-600 mb-8">
          Utilisez notre moteur de recherche pour trouver le bon professionnel pour votre mission.
        </p>
        <img
          src="https://placehold.co/600x400"
          alt="Recherche prestataire"
          className="w-full rounded-lg shadow mb-8"
        />
        <button className="bg-primary text-white px-6 py-3 rounded-full hover:bg-opacity-90">
          Lancer la recherche
        </button>
      </div>
    </Layout>
  );
}
