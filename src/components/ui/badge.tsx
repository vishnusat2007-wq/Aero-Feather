import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "cyan" | "outline" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
        variant === "default" && "bg-af-cyan/15 text-af-cyan",
        variant === "cyan" && "border border-af-cyan/30 bg-af-cyan/10 text-af-cyan",
        variant === "outline" && "border border-af-cyan/20 text-af-muted",
        variant === "muted" && "bg-af-surface text-af-muted",
        className,
      )}
      {...props}
    />
  );
}
