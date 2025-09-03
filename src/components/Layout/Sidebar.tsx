import React from "react";
import {
  Home,
  Users,
  Settings,
  BarChart3,
  PenTool as Tool,
  MessageSquare,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const menuItems: Record<string, MenuItem[]> = {
  admin: [
    { id: "dashboard", label: "Tableau de bord", icon: Home, path: "/admin/dashboard" },
    { id: "users", label: "Utilisateurs", icon: Users, path: "/admin/users" },
    { id: "services", label: "Services", icon: Tool, path: "/admin/services" },
    { id: "analytics", label: "Analyses", icon: BarChart3, path: "/admin/analytics" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/admin/messages" },
    { id: "settings", label: "Paramètres", icon: Settings, path: "/admin/settings" },
  ],
  provider: [
    { id: "missions", label: "Missions", icon: Home, path: "/app/provider/missions" },
    { id: "planning", label: "Planning", icon: Tool, path: "/app/provider/planning" },
    { id: "earnings", label: "Revenus", icon: BarChart3, path: "/app/provider/earnings" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/app/provider/messages" },
  ],
  client: [
    { id: "dashboard", label: "Tableau de bord", icon: Home, path: "/app/client/dashboard" },
    { id: "requests", label: "Mes demandes", icon: Tool, path: "/app/client/requests" },
    { id: "invoices", label: "Mes factures", icon: BarChart3, path: "/app/client/invoices" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/app/client/messages" },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = (user?.roles?.[0] || "client").toLowerCase();
  const items = menuItems[role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ✅ Sidebar full height */}
        <div className="flex flex-col h-screen">
          {/* header */}
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
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary-50 text-primary-700 border-r-4 border-primary-500 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* ✅ footer avec bouton logout */}
          <div className="p-4 border-t space-y-3">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>

            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 text-white">
              <h3 className="font-semibold text-sm">Besoin d'aide ?</h3>
              <p className="text-xs opacity-90 mt-1">Contactez notre support</p>
              <button className="mt-2 text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-colors">
                Contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
