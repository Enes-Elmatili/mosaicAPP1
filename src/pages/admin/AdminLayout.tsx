import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();

  const links = [
    { path: "/admin/dashboard", label: "📊 Dashboard" },
    { path: "/admin/users", label: "👤 Utilisateurs" },
    { path: "/admin/requests", label: "📑 Demandes" },
    { path: "/admin/missions", label: "🚀 Missions" },
    { path: "/admin/tickets", label: "🎫 Tickets" },
    { path: "/admin/documents", label: "📂 Documents" },
    { path: "/admin/roles-permissions", label: "🔐 Rôles & Permissions" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 text-xl font-bold border-b">Espace Admin</div>
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
