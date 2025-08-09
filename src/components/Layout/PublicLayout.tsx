import React from 'react';
import { Link, Outlet } from 'react-router-dom';

/**
 * Layout for public (non-authenticated) pages: header nav, main content, footer.
 */
const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <header className="bg-white shadow">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800">
          MOSAIC
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Accueil
          </Link>
          <Link to="/rental/search" className="text-gray-600 hover:text-gray-800">
            Rechercher
          </Link>
          <Link to="/offers" className="text-gray-600 hover:text-gray-800">
            Offres & Abos
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-800">
            Tarifs
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-800">
            Connexion
          </Link>
          <Link to="/signup" className="text-gray-600 hover:text-gray-800">
            Création de compte
          </Link>
        </div>
      </nav>
    </header>

    <main className="flex-grow container mx-auto px-6 py-8">
      <Outlet />
    </main>

    <footer className="bg-gray-100">
      <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} MOSAIC. Tous droits réservés.
      </div>
    </footer>
  </div>
);

export default PublicLayout;
