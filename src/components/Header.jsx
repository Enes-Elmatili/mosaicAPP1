/**
 * Header.jsx
 * En-tête fixe avec logo et navigation principale.
 */
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/outline';

export default function Header() {
  return (
    <header className="bg-white shadow fixed w-full z-10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center text-primary">
          <HomeIcon className="h-8 w-8 mr-2" />
          <span className="font-semibold text-xl">MOSAÏC</span>
        </Link>
        <nav>
          <Link to="/" className="mx-2 hover:text-primary">Accueil</Link>
          <Link to="/search" className="mx-2 hover:text-primary">Rechercher</Link>
          <Link to="/offers" className="mx-2 hover:text-primary">Offres</Link>
          <Link to="/pricing" className="mx-2 hover:text-primary">Tarifs</Link>
          <Link to="/login" className="mx-2 hover:text-primary">Connexion</Link>
        </nav>
      </div>
    </header>
  );
}
