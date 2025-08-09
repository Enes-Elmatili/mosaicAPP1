/**
 * Signup.jsx
 * Page de création de compte pour les nouveaux utilisateurs.
 */
import Layout from '../components/Layout';

export default function Signup() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <form className="w-full max-w-sm bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
          {/* Nom complet */}
          <label className="block mb-2">Nom complet</label>
          <input
            type="text"
            placeholder="Votre nom"
            className="w-full border rounded px-3 py-2 mb-4"
          />
          {/* Email */}
          <label className="block mb-2">Email</label>
          <input
            type="email"
            placeholder="votre@exemple.com"
            className="w-full border rounded px-3 py-2 mb-4"
          />
          {/* Mot de passe */}
          <label className="block mb-2">Mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border rounded px-3 py-2 mb-6"
          />
          {/* Call-to-action */}
          <button className="w-full bg-primary text-white py-2 rounded-full mb-4">
            S'inscrire
          </button>
          {/* Lien vers connexion */}
          <p className="text-center text-sm">
            Déjà un compte?{' '}
            <a href="/login" className="text-primary font-semibold">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </Layout>
  );
}
