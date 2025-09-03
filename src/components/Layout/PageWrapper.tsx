import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";

type Props = {
  title?: string;
  children?: ReactNode;
  className?: string;
  container?: boolean;
  headerVariant?: "transparent" | "solid";
};

const PageWrapper: React.FC<Props> = ({
  title,
  children,
  className = "",
  container = true,
  headerVariant = "solid",
}) => {
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
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent"
          >
            MOSAÏC
          </Link>

          {/* Actions (placeholder recherche + dropdown menu) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="h-10 w-10 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-neutral-700 transition"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition"
              >
                Menu
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-700 bg-neutral-900 shadow-lg overflow-hidden">
                  <Link
                    to="/offers"
                    className="block px-4 py-2 text-sm hover:bg-neutral-800"
                    onClick={() => setOpenDropdown(false)}
                  >
                    Offres
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm hover:bg-neutral-800"
                    onClick={() => setOpenDropdown(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-sm text-secondary font-semibold hover:bg-neutral-800"
                    onClick={() => setOpenDropdown(false)}
                  >
                    Créer un compte
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer si header SOLIDE */}
      {headerVariant === "solid" && <div className="h-20 md:h-[88px]" />}

      {/* CONTENU */}
      <main
        className={`${container ? "container mx-auto px-4 md:px-6" : ""} ${className} animate-fadeIn`}
      >
        {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
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
};

export default PageWrapper;
