"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

import {
  getStoredValueServerSnapshot,
  getStoredValueSnapshot,
  setStoredValue,
  subscribeToStoredValue,
} from "@/lib/local-storage-store";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "civix-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useThemeStore(): Theme {
  const subscribe = useCallback(
    (listener: () => void) => subscribeToStoredValue(STORAGE_KEY, listener),
    [],
  );
  const getSnapshot = useCallback(() => getStoredValueSnapshot(STORAGE_KEY), []);

  const stored = useSyncExternalStore(subscribe, getSnapshot, getStoredValueServerSnapshot);

  return stored === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore();

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setStoredValue(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }, [theme]);

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
