import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-af-cyan/15 bg-af-surface px-4 py-2 text-sm text-af-text shadow-sm transition-colors placeholder:text-af-muted/60 focus-visible:border-af-cyan/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-af-cyan/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-af-cyan/15 bg-af-surface px-4 py-3 text-sm text-af-text shadow-sm transition-colors placeholder:text-af-muted/60 focus-visible:border-af-cyan/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-af-cyan/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-af-muted", className)}
      {...props}
    />
  );
}
