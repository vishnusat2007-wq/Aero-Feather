"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { persistTheme, type Theme } from "@/lib/theme";

const STORAGE_KEY = "aero-feather-theme";

function readThemeFromDom(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/** Must match server render — beforeInteractive script may set html class client-side only */
function getServerTheme(): Theme {
  return "dark";
}

function subscribeTheme(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", onStorage);

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    window.removeEventListener("storage", onStorage);
    observer.disconnect();
  };
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readThemeFromDom,
    getServerTheme,
  );

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = readThemeFromDom() === "dark" ? "light" : "dark";
    persistTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className="theme-transition min-h-full" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
