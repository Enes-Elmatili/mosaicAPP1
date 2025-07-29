import React, { useState } from 'react';
import { Bell, Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { notifications } = useDataStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg px-4 py-2 max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {notification.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Paramètres</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};