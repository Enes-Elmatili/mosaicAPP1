import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import PageWrapper from '../../components/layouts/PageWrapper';

const OfflinePage: React.FC = () => {
  return (
    <PageWrapper title="Vous êtes hors-ligne">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-4 rounded-full bg-red-100 text-red-600">
          <WifiOff className="h-10 w-10" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          Vous êtes hors-ligne
        </h1>
        <p className="mt-2 text-gray-600 max-w-md">
          Il semble que votre connexion Internet soit interrompue.  
          Vérifiez votre réseau ou réessayez dans un instant.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-gray-800 hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    </PageWrapper>
  );
};

export default OfflinePage;
