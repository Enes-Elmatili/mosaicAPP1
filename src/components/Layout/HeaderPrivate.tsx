// src/components/layout/HeaderPrivate.tsx
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function HeaderPrivate({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
      <button
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        onClick={onToggleSidebar}
      >
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Tableau de bord</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </header>
  );
}
