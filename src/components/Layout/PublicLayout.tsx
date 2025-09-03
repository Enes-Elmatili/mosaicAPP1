import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";

const PublicLayout = () => {
  const { pathname } = useLocation();

  // Routes avec header transparent (landing + offres)
  const transparentRoutes = new Set<string>(["/", "/offers"]);
  const isTransparent = transparentRoutes.has(pathname);

  // Dropdown Menu
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Recherche
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

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
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  return (
    <div className="flex flex-col min-h-screen bg-primary text-neutral-100 font-sans">
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
            <Link to="/" aria-label="Accueil" className="inline-flex items-center gap-2">
              {isTransparent ? (
                <img src="/logo.png" alt="MOSAÏC" className="h-8 w-auto drop-shadow" />
              ) : (
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent">
                  MOSAÏC
                </span>
              )}
            </Link>

            <div className="flex-1" />

            {/* Actions */}
            <div className="relative flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                {!showSearch ? (
                  <button
                    onClick={() => setShowSearch(true)}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-full transition ${
                      isTransparent
                        ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
                        : "border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                    }`}
                    aria-label="Rechercher"
                    type="button"
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
                  className={`inline-flex items-center gap-2 rounded-full px-4 h-10 text-sm font-semibold transition ${
                    isTransparent
                      ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
                      : "border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  }`}
                  type="button"
                >
                  Menu
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openDropdown ? "rotate-180" : ""}`}
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
                      className="block px-4 py-3 font-semibold text-secondary hover:bg-neutral-800"
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

      {/* Spacer si header solid */}
      {!isTransparent && <div className="h-20 md:h-[88px]" />}

      {/* Contenu */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} MOSAÏC. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
