/**
 * Login.jsx
 * Page de connexion pour les utilisateurs existants.
 */
import Layout from '../components/Layout';

export default function Login() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <form className="w-full max-w-sm bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
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
            Se connecter
          </button>
          {/* Lien vers inscription */}
          <p className="text-center text-sm">
            Pas encore de compte?{' '}
            <a href="/signup" className="text-primary font-semibold">
              Créer un compte
            </a>
          </p>
        </form>
      </div>
    </Layout>
  );
}
