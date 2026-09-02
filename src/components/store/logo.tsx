import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  size?: number;
  glow?: boolean;
  priority?: boolean;
};

/** Official Aero Feather mark — transparent PNG derived from supplied logo */
export function LogoMark({
  className,
  size = 40,
  glow = false,
  priority = false,
}: LogoMarkProps) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      aria-hidden
      className={cn(
        "shrink-0 object-contain",
        /* Preserve authentic colours; boost visibility on dark backgrounds without altering geometry */
        "dark:brightness-[1.12] dark:contrast-[1.08]",
        glow &&
          "drop-shadow-[0_0_10px_rgba(32,182,232,0.2)] dark:drop-shadow-[0_0_16px_rgba(32,182,232,0.32)]",
        className,
      )}
    />
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
        className="transition-transform duration-300 group-hover:scale-[1.03]"
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
