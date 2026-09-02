import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "cyan" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variant === "default" && "bg-navy text-white",
        variant === "cyan" && "bg-cyan/15 text-navy",
        variant === "outline" && "border border-navy/20 text-navy",
        className,
      )}
      {...props}
    />
  );
}
