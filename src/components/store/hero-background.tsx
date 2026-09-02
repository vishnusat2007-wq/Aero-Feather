/** Faint court geometry & aerodynamic diagram overlays for the hero */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.06]"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Badminton court outline — faint */}
        <rect x="8%" y="20%" width="35%" height="55%" fill="none" stroke="#20B6E8" strokeWidth="0.5" />
        <line x1="25.5%" y1="20%" x2="25.5%" y2="75%" stroke="#20B6E8" strokeWidth="0.5" />
        <line x1="8%" y1="47.5%" x2="43%" y2="47.5%" stroke="#20B6E8" strokeWidth="0.5" strokeDasharray="4 6" />

        {/* Service boxes */}
        <rect x="8%" y="20%" width="17.5%" height="27.5%" fill="none" stroke="#20B6E8" strokeWidth="0.3" opacity="0.6" />
        <rect x="25.5%" y="47.5%" width="17.5%" height="27.5%" fill="none" stroke="#20B6E8" strokeWidth="0.3" opacity="0.6" />

        {/* Aerodynamic flow lines */}
        <path
          d="M 55 180 Q 120 120 200 140 T 380 100"
          fill="none"
          stroke="#168CD8"
          strokeWidth="0.5"
          strokeDasharray="2 6"
          className="animate-hero-drift"
        />
        <path
          d="M 60 220 Q 150 160 240 180 T 420 150"
          fill="none"
          stroke="#20B6E8"
          strokeWidth="0.4"
          opacity="0.5"
        />

        {/* Orbital arc — logo echo */}
        <ellipse
          cx="75%"
          cy="45%"
          rx="120"
          ry="40"
          fill="none"
          stroke="#20B6E8"
          strokeWidth="0.5"
          transform="rotate(-25 900 320)"
          opacity="0.4"
        />
      </svg>

      {/* Corner accent dots */}
      <div className="absolute left-[6%] top-[18%] h-1 w-1 rounded-full bg-af-cyan/20" />
      <div className="absolute left-[43%] top-[75%] h-1 w-1 rounded-full bg-af-cyan/15" />
      <div className="absolute right-[12%] top-[30%] h-1.5 w-1.5 rounded-full bg-af-cyan/10" />
    </div>
  );
}
