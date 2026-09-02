import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  size?: number;
  glow?: boolean;
};

/** Transparent Aero Feather symbol — no white background */
export function LogoMark({ className, size = 40, glow = false }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      className={cn(
        "shrink-0",
        glow && "drop-shadow-[0_0_12px_rgba(32,182,232,0.35)]",
        "dark:drop-shadow-[0_0_14px_rgba(32,182,232,0.28)]",
        className,
      )}
    >
      <defs>
        <linearGradient id="af-swoosh-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20B6E8" />
          <stop offset="100%" stopColor="#168CD8" />
        </linearGradient>
        <linearGradient id="af-a-fill" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" className="[stop-color:var(--logo-navy)]" />
          <stop offset="100%" className="[stop-color:var(--logo-navy-light)]" />
        </linearGradient>
      </defs>
      {/* Outer ring — stroke only, no fill */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        className="stroke-[var(--logo-navy)]"
        strokeWidth="2.5"
      />
      {/* Orbital swoosh — cyan arc */}
      <ellipse
        cx="50"
        cy="50"
        rx="34"
        ry="13"
        fill="none"
        stroke="url(#af-swoosh-cyan)"
        strokeWidth="2.8"
        transform="rotate(-28 50 50)"
        strokeLinecap="round"
        strokeDasharray="60 140"
      />
      {/* Orbital swoosh — navy arc */}
      <ellipse
        cx="50"
        cy="50"
        rx="34"
        ry="13"
        fill="none"
        className="stroke-[var(--logo-navy)]"
        strokeWidth="2"
        transform="rotate(152 50 50)"
        strokeLinecap="round"
        strokeDasharray="70 130"
        opacity="0.85"
      />
      {/* Letter A */}
      <path
        d="M50 22 L34 72 L42 72 L46 58 L54 58 L58 72 L66 72 Z M48 50 L52 50 L50 42 Z"
        fill="url(#af-a-fill)"
      />
    </svg>
  );
}

type BrandLockupProps = {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
};

export function BrandLockup({
  className,
  markSize = 38,
  showTagline = true,
}: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={markSize} glow className="transition-transform duration-300 group-hover:scale-[1.03]" />
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
