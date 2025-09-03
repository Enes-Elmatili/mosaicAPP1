import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/context";
import { Button } from "@/components/ui/button";

interface OutletContext {
  search: string;
  filter: string;
}

export default function AdminLayout() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 text-xl font-bold border-b">⚙️ Admin</div>
        <nav className="flex-1 p-2 space-y-2">
          <NavLink to="/admin/dashboard" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${isActive ? "bg-gray-300 font-semibold" : ""}`
          }>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-200">
            Utilisateurs
          </NavLink>
          <NavLink to="/admin/roles-permissions" className="block px-4 py-2 rounded hover:bg-gray-200">
            Rôles & Permissions
          </NavLink>
          <NavLink to="/admin/tickets" className="block px-4 py-2 rounded hover:bg-gray-200">
            Tickets
          </NavLink>
          <NavLink to="/admin/missions" className="block px-4 py-2 rounded hover:bg-gray-200">
            Missions
          </NavLink>
          <NavLink to="/admin/documents" className="block px-4 py-2 rounded hover:bg-gray-200">
            Documents
          </NavLink>
          <NavLink to="/admin/requests" className="block px-4 py-2 rounded hover:bg-gray-200">
            Demandes
          </NavLink>
        </nav>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white border-b px-6 py-3">
          {/* Recherche */}
          <div className="flex items-center gap-2 w-1/2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm focus:ring focus:ring-indigo-500"
            />
          </div>

          {/* Filtres + Actions */}
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              aria-label="Filtrer les éléments"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <button
              type="button"
              className="relative p-2 rounded hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Admin</span>
              </button>

              {/* ✅ Bouton Déconnexion */}
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ search, filter } satisfies OutletContext} />
        </main>
      </div>
    </div>
  );
}
