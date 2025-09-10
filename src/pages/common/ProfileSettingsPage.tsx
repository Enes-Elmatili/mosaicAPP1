import React from 'react';
import { User, Lock, Bell, Globe, LogOut } from 'lucide-react';
import PageWrapper from '../../components/layouts/PageWrapper';

const ProfileSettingsPage: React.FC = () => {
  return (
    <PageWrapper title="Profil & Paramètres">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profil utilisateur */}
        <div className="flex items-center gap-4 p-6 rounded-3xl border border-white/10 bg-white/70 backdrop-blur-md shadow-md">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
            E
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enès Elmatili</h2>
            <p className="text-sm text-gray-500">enes@mosaicpropertymanagements.com</p>
          </div>
        </div>

        {/* Paramètres */}
        <div className="rounded-3xl border border-white/10 bg-white/70 backdrop-blur-md shadow-md divide-y divide-gray-200/70">
          <button className="flex w-full items-center gap-3 p-4 hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left text-gray-900">Informations personnelles</span>
          </button>
          <button className="flex w-full items-center gap-3 p-4 hover:bg-gray-100 transition-colors">
            <Lock className="h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left text-gray-900">Sécurité & Mot de passe</span>
          </button>
          <button className="flex w-full items-center gap-3 p-4 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left text-gray-900">Préférences de notifications</span>
          </button>
          <button className="flex w-full items-center gap-3 p-4 hover:bg-gray-100 transition-colors">
            <Globe className="h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left text-gray-900">Langue & Région</span>
          </button>
        </div>

        {/* Déconnexion */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-gray-800 hover:scale-[1.02]">
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfileSettingsPage;
