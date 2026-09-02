import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  size?: number;
  glow?: boolean;
  priority?: boolean;
};

/** Circular Aero Feather emblem — A + swoosh only, no wordmark */
export function LogoMark({
  className,
  size = 40,
  glow = false,
  priority = false,
}: LogoMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "border border-af-cyan/20 bg-af-surface/80",
        glow && "shadow-[0_0_20px_rgba(32,182,232,0.18)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-mark-circle.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        aria-hidden
        className={cn(
          "h-full w-full object-cover",
          "dark:brightness-[1.1] dark:contrast-[1.06]",
        )}
      />
    </span>
  );
}

type BrandLockupProps = {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
};

export function BrandLockup({
  className,
  markSize = 40,
  showTagline = true,
}: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark
        size={markSize}
        glow
        priority
        className="transition-transform duration-300 group-hover:scale-[1.04]"
      />
      <div className="hidden sm:block leading-none">
        <p className="text-[13px] font-bold tracking-[0.2em] text-af-text">
          AERO <span className="text-af-cyan">FEATHER</span>
        </p>
        {showTagline && (
          <p className="mt-1 text-[9px] font-medium tracking-[0.24em] text-af-muted uppercase">
            Premium Shuttlecocks
          </p>
        )}
      </div>
    </div>
  );
}
