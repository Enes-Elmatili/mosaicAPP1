import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { PropertyList } from './components/Properties/PropertyList';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'properties':
        return <PropertyList />;
      case 'bookings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Réservations</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      case 'users':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Utilisateurs</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      case 'services':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Services</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Analyses</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      case 'messages':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
            <p className="text-gray-600">Module en cours de développement...</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default App;