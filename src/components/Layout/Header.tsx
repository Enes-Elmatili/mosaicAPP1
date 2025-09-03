import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";

type Props = {
  children?: React.ReactNode;
  className?: string;
  container?: boolean;
  headerVariant?: "transparent" | "solid";
};

export default function PageWrapper({
  children,
  className = "",
  container = true,
  headerVariant = "transparent",
}: Props) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Fermer dropdown au clic extérieur / ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(false);
        setShowSearch(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Focus auto quand on ouvre la recherche
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const isTransparent = headerVariant === "transparent";

  return (
    <div className="relative min-h-screen bg-primary text-neutral-100">
      {/* HEADER */}
      <header
        className={
          isTransparent
            ? "absolute inset-x-0 top-0 z-20"
            : "relative z-20 border-b border-neutral-800 bg-neutral-900"
        }
      >
        <div className="container mx-auto px-4 md:px-6">
          <nav
            className={
              isTransparent
                ? "mt-3 flex items-center justify-between rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-2 shadow-[0_2px_30px_rgba(0,0,0,0.25)]"
                : "flex items-center justify-between py-3"
            }
          >
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2" aria-label="Accueil">
              {isTransparent ? (
                <img src="/logo.png" alt="MOSAÏC" className="h-8 w-auto drop-shadow" />
              ) : (
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent">
                  MOSAÏC
                </span>
              )}
            </Link>

            <div className="flex-1" />

            {/* Actions droites */}
            <div className="flex items-center gap-2">
              {/* Recherche */}
              <div className="relative">
                {!showSearch ? (
                  <button
                    onClick={() => setShowSearch(true)}
                    className={
                      isTransparent
                        ? "inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white transition"
                        : "inline-flex items-center justify-center h-10 w-10 rounded-full border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                    }
                    aria-label="Rechercher"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[260px] md:w-[320px] rounded-full border border-neutral-700 bg-neutral-900 shadow-lg px-4 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full bg-transparent outline-none text-sm text-neutral-100 placeholder-neutral-500"
                      onBlur={() => setTimeout(() => setShowSearch(false), 120)}
                    />
                  </div>
                )}
              </div>

              {/* Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenDropdown((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={openDropdown}
                  className={
                    isTransparent
                      ? "inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 px-4 h-10 text-sm font-semibold text-white transition"
                      : "inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-4 h-10 text-sm font-semibold text-neutral-200 transition"
                  }
                >
                  Menu
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openDropdown ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {openDropdown && (
                  <div
                    role="menu"
                    tabIndex={-1}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-xl overflow-hidden"
                  >
                    <Link
                      to="/offers"
                      role="menuitem"
                      className="block px-4 py-3 hover:bg-neutral-800"
                      onClick={() => setOpenDropdown(false)}
                    >
                      Offres
                    </Link>
                    <Link
                      to="/login"
                      role="menuitem"
                      className="block px-4 py-3 hover:bg-neutral-800"
                      onClick={() => setOpenDropdown(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/signup"
                      role="menuitem"
                      className="block px-4 py-3 hover:bg-neutral-800 font-semibold text-secondary"
                      onClick={() => setOpenDropdown(false)}
                    >
                      Créer un compte
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Spacer si header SOLIDE */}
      {headerVariant === "solid" && <div className="h-20 md:h-[88px]" />}

      {/* CONTENU */}
      <main
        className={`${container ? "container mx-auto px-4 md:px-6" : ""} ${className} animate-fadeIn`}
      >
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900 mt-16 border-t border-neutral-800">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} MOSAÏC. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
