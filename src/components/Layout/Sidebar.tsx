import React from 'react';
import { Home, Building, Calendar, Users, Settings, BarChart3, PenTool as Tool, MessageSquare, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<any>;
  requiredPermission: string;
}

const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, requiredPermission: 'dashboard.read' },
    { id: 'properties', label: 'Propriétés', icon: Building },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'services', label: 'Services', icon: Tool },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ],
  client: [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'properties', label: 'Propriétés', icon: Building },
    { id: 'bookings', label: 'Mes réservations', icon: Calendar },
    { id: 'services', label: 'Services', icon: Tool },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ],
  locataire: [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'properties', label: 'Mon logement', icon: Building },
    { id: 'services', label: 'Demandes', icon: Tool },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ],
  prestataire: [
    { id: 'dashboard', label: 'Accueil', icon: Home, requiredPermission: 'dashboard.read' },
    { id: 'services', label: 'Mes services', icon: Tool },
    { id: 'bookings', label: 'Interventions', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const items = menuItems[user?.roles[0] || 'client'] || [];
  // filter by permission
  const filtered = items.filter((item) =>
    user?.effectivePermissions.includes(item.requiredPermission)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-800">MOSAIC</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
        {filtered.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 text-white">
            <h3 className="font-semibold text-sm">Besoin d'aide ?</h3>
            <p className="text-xs opacity-90 mt-1">Contactez notre support</p>
            <button className="mt-2 text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-colors">
              Contacter
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
