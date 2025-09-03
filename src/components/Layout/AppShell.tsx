import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Home,
  FileText,
  Users,
  Wallet,
  Settings,
} from "lucide-react"; // icônes premium sobres

const navItems = [
  { to: "/app", label: "Accueil", icon: Home },
  { to: "/app/requests", label: "Demandes", icon: FileText },
  { to: "/app/providers", label: "Prestataires", icon: Users },
  { to: "/app/wallet", label: "Portefeuille", icon: Wallet },
  { to: "/app/settings", label: "Paramètres", icon: Settings },
];

const AppShell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary text-neutral-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-neutral-800 bg-neutral-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <Link
            to="/"
            className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent"
          >
            MOSAÏC
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink text-white shadow"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-neutral-800 text-xs text-neutral-500">
          © {new Date().getFullYear()} MOSAÏC
        </div>
      </aside>

      {/* MAIN + HEADER MOBILE */}
      <div className="flex flex-col flex-1">
        {/* HEADER MOBILE */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
          <Link
            to="/"
            className="font-bold text-xl bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent"
          >
            MOSAÏC
          </Link>
          <ThemeToggle />
        </header>

        {/* CONTENU */}
        <main className="flex-1 p-6 animate-fadeIn">
          <Outlet />
        </main>

        {/* TABBAR MOBILE */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-neutral-800 bg-neutral-900 flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center text-xs transition ${
                  active
                    ? "text-secondary"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AppShell;