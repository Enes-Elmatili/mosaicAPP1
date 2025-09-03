// src/pages/app/client/ClientLayout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ClientLayout() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">
          🏡 Client
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/app/client/dashboard" className="block hover:text-indigo-600">
            📊 Dashboard
          </Link>
          <Link to="/app/client/requests" className="block hover:text-indigo-600">
            📋 Mes demandes
          </Link>
          <Link to="/app/client/requests/new" className="block hover:text-indigo-600">
            ➕ Nouvelle demande
          </Link>
          <Link to="/app/client/invoices" className="block hover:text-indigo-600">
            💳 Factures
          </Link>
          <Link to="/app/client/contracts" className="block hover:text-indigo-600">
            📑 Contrats
          </Link>
          <Link to="/app/client/tickets" className="block hover:text-indigo-600">
            🎫 Tickets support
          </Link>
        </nav>
      </aside>

      {/* --- Contenu principal --- */}
      <main className="flex-1 flex flex-col">
        {/* --- Topbar --- */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded-md"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-2 py-1 rounded-md"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
          <button
            onClick={() => navigate("/app/profile")}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md"
          >
            Mon Profil
          </button>
        </header>

        {/* --- Pages enfants --- */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ search, filter }} />
        </div>
      </main>
    </div>
  );
}
    