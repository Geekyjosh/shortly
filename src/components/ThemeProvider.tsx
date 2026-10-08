"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
};

type Theme = "dark" | "light";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "shortly-theme";
const THEME_EVENT = "shortly-theme-change";

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getThemeSnapshot(): Theme {
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const darkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function toggleTheme() {
    const nextTheme: Theme = darkMode ? "light" : "dark";

    localStorage.setItem(THEME_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div
        className={
          darkMode
            ? "min-h-screen bg-slate-950 text-white"
            : "min-h-screen bg-slate-100 text-slate-950"
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
