"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme.provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-xs transition-colors hover:opacity-80",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-200",
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0",
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-200",
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
