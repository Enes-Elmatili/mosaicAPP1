import React, { useState } from 'react';
import Layout from '../components/Layout';

/**
 * Page de connexion / inscription. Toggle entre les deux formulaires.
 */
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    // Appeler API de connexion ou d'inscription ici
    console.log(isLogin ? 'Login' : 'Signup', form);
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!isLogin && (
            <div className="mb-4">
              <label className="block mb-1">Nom complet</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button className="w-full bg-primary text-white py-2 rounded-full mb-4">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </button>
          <p className="text-center text-sm">
            {isLogin ? (
              <>
                Pas de compte?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary font-semibold"
                >
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Déjà un compte?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-semibold"
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </Layout>
  );
}
