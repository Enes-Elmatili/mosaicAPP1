import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // icônes sobres premium

export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`
        relative flex items-center justify-center
        h-10 w-10 rounded-full border transition-all
        border-neutral-700 bg-neutral-900 text-neutral-100
        shadow-md hover:border-secondary hover:shadow-strong
        dark:border-neutral-300 dark:bg-neutral-100 dark:text-neutral-900
        hover:bg-gradient-to-r hover:from-secondary hover:via-secondary-purple hover:to-secondary-pink
        focus:outline-none focus:ring-4 focus:ring-secondary/30
        active:scale-95
      `}
      aria-label="Basculer le thème"
    >
      <span className="sr-only">Changer de thème</span>
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: dark ? "rotate(0deg)" : "rotate(180deg)" }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </div>
    </button>
  );
};
