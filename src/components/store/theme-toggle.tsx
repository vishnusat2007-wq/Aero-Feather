"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/store/theme-provider";
import type { Theme } from "@/lib/theme";

type Props = {
  className?: string;
  /** Wider Dark/Light segmented control for headers and admin chrome. */
  labeled?: boolean;
};

export function ThemeToggle({ className, labeled = true }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn(
        "inline-flex h-9 items-center overflow-hidden rounded-lg border border-af-cyan/15 bg-af-surface/50 p-0.5",
        className,
      )}
    >
      <ThemeOption
        value="light"
        current={theme}
        onSelect={setTheme}
        labeled={labeled}
        label="Light"
        icon={Sun}
        iconClass="text-amber-500"
      />
      <ThemeOption
        value="dark"
        current={theme}
        onSelect={setTheme}
        labeled={labeled}
        label="Dark"
        icon={Moon}
        iconClass="text-af-cyan"
      />
    </div>
  );
}

function ThemeOption({
  value,
  current,
  onSelect,
  labeled,
  label,
  icon: Icon,
  iconClass,
}: {
  value: Theme;
  current: Theme;
  onSelect: (theme: Theme) => void;
  labeled: boolean;
  label: string;
  icon: typeof Sun;
  iconClass: string;
}) {
  const selected = current === value;

  return (
    <button
      type="button"
      aria-label={`Switch to ${label.toLowerCase()} mode`}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-[12px] font-semibold transition-all",
        selected
          ? "bg-af-surface-elevated text-af-text shadow-sm"
          : "text-af-muted hover:text-af-text",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", selected && iconClass)}
        strokeWidth={1.75}
      />
      {labeled && <span>{label}</span>}
    </button>
  );
}
