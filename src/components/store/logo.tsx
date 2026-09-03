import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  size?: number;
  glow?: boolean;
  priority?: boolean;
};

/** Official Aero Feather circular logo — forced perfect circle in light & dark */
export function LogoMark({
  className,
  size = 40,
  glow = false,
  priority = false,
}: LogoMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-white",
        "aspect-square ring-1 ring-black/5 dark:ring-white/15",
        glow && "shadow-[0_0_20px_rgba(32,182,232,0.25)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        clipPath: "circle(50%)",
        WebkitClipPath: "circle(50%)",
      }}
    >
      <Image
        src="/logo-circle.png"
        alt="Aero Feather"
        width={size}
        height={size}
        priority={priority}
        className="absolute inset-0 h-full w-full rounded-full object-cover"
        style={{ borderRadius: "50%" }}
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
  markSize = 44,
  showTagline = true,
}: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark
        size={markSize}
        glow
        priority
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {showTagline && (
        <div className="hidden leading-none sm:block">
          <p className="text-[13px] font-bold tracking-[0.2em] text-af-text">
            AERO <span className="text-af-cyan">FEATHER</span>
          </p>
          <p className="mt-1 text-[9px] font-medium tracking-[0.24em] text-af-muted uppercase">
            Premium Shuttlecocks
          </p>
        </div>
      )}
    </div>
  );
}
