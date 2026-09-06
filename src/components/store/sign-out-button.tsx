"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className, label = "Sign out" }: Props) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-af-cyan/25 bg-af-surface/70 px-3 text-[13px] font-semibold text-af-text transition-all hover:border-af-cyan/50 hover:bg-af-surface hover:text-af-cyan",
          className,
        )}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </button>
    </form>
  );
}
