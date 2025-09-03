import React from 'react';
import { ShieldAlert, LockKeyhole, Home, LogIn } from 'lucide-react';
import PageWrapper from '../../components/Layout/PageWrapper';

const UnauthorizedPage: React.FC = () => {
  const goHome = () => (window.location.href = '/');
  const goLogin = () => (window.location.href = '/login');

  return (
    <PageWrapper title="Non autorisé">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600 ring-1 ring-red-100">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">Accès refusé</h1>
        <p className="mt-2 max-w-md text-gray-600">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          Si vous pensez qu'il s'agit d'une erreur, contactez le support ou reconnectez-vous.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-5 py-2 text-sm font-medium text-gray-800 backdrop-blur-md transition hover:bg-white"
          >
            <Home className="h-4 w-4" />
            Retour à l’accueil
          </button>
          <button
            onClick={goLogin}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-black/90 active:scale-[.98]"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <LockKeyhole className="h-3.5 w-3.5" />
          <span>Code d’erreur : 403 — Non autorisé</span>
        </div>
      </div>
    </PageWrapper>
  );
};

export default UnauthorizedPage;
