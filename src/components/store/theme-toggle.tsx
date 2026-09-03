"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/store/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg",
        "border border-af-cyan/15 bg-af-surface/50 text-af-muted",
        "transition-all duration-300 hover:border-af-cyan/35 hover:text-af-cyan",
        "hover:shadow-[0_0_16px_rgba(32,182,232,0.12)]",
      )}
    >
      <Sun
        className={cn(
          "absolute h-[17px] w-[17px] transition-all duration-500",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-amber-500",
        )}
        strokeWidth={1.75}
      />
      <Moon
        className={cn(
          "absolute h-[17px] w-[17px] transition-all duration-500",
          isDark
            ? "rotate-0 scale-100 opacity-100 text-af-cyan"
            : "-rotate-90 scale-0 opacity-0",
        )}
        strokeWidth={1.75}
      />
    </button>
  );
}
