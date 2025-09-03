import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context";

export const PrivateLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Titre selon le rôle
  const getDashboardTitle = () => {
    const fullName =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      user?.name ||
      "Utilisateur";

    if (user?.roles?.includes("admin"))
      return `👑 Admin Dashboard – ${fullName}`;
    if (user?.roles?.includes("provider"))
      return `⚡ Prestataire Dashboard – ${fullName}`;
    if (user?.roles?.includes("client"))
      return `🏡 Client Dashboard – ${fullName}`;

    return `Bienvenue ${fullName}`;
  };

  // Boutons rapides selon rôle
  const renderQuickActions = () => {
    if (user?.roles?.includes("client")) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/app/client/requests/new")}
            className="btn-primary"
          >
            ➕ Nouvelle demande
          </button>
          <button
            onClick={() => navigate("/app/client/invoices")}
            className="btn-secondary"
          >
            📑 Mes factures
          </button>
        </div>
      );
    }
    if (user?.roles?.includes("provider")) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/app/provider/planning")}
            className="btn-primary"
          >
            📅 Mon planning
          </button>
          <button
            onClick={() => navigate("/app/provider/earnings")}
            className="btn-secondary"
          >
            💰 Mes revenus
          </button>
        </div>
      );
    }
    if (user?.roles?.includes("admin")) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/users")}
            className="btn-primary"
          >
            👥 Gérer utilisateurs
          </button>
          <button
            onClick={() => navigate("/admin/requests")}
            className="btn-secondary"
          >
            📌 Voir demandes
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h1 className="font-bold text-lg">{getDashboardTitle()}</h1>

          {renderQuickActions()}

          <button
            onClick={logout}
            className="ml-4 text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
          >
            Déconnexion
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
