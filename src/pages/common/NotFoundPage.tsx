import React from 'react';
import { Home } from 'lucide-react';
import PageWrapper from '../../components/Layout/PageWrapper';

const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper title="Page non trouvée">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-[5rem] font-extrabold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent leading-none">
          404
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-lg">
          Oups… La page que vous recherchez n’existe pas ou a été déplacée.
        </p>

        <button
          onClick={() => (window.location.href = '/')}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-gray-800 hover:scale-[1.02]"
        >
          <Home className="h-4 w-4" />
          Retour à l’accueil
        </button>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
