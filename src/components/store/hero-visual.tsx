export function HeroVisual() {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center lg:min-h-[520px]">
      <div className="absolute inset-0 animate-af-glow rounded-full bg-af-cyan/10 blur-[100px]" />

      <svg
        viewBox="0 0 480 480"
        className="relative h-full w-full max-w-[480px] animate-af-float"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="swoosh-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20B6E8" />
            <stop offset="100%" stopColor="#168CD8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="swoosh-navy" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#142449" />
            <stop offset="100%" stopColor="#20B6E8" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbital swoosh — logo inspired */}
        <ellipse
          cx="240"
          cy="240"
          rx="160"
          ry="60"
          stroke="url(#swoosh-cyan)"
          strokeWidth="2.5"
          transform="rotate(-25 240 240)"
          opacity="0.9"
          filter="url(#glow)"
        />
        <ellipse
          cx="240"
          cy="240"
          rx="160"
          ry="60"
          stroke="url(#swoosh-navy)"
          strokeWidth="1.5"
          transform="rotate(155 240 240)"
          opacity="0.5"
        />

        {/* Flight trails */}
        <path
          d="M 80 200 Q 160 120 240 180 T 400 160"
          stroke="#20B6E8"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          opacity="0.5"
          style={{ animation: "af-flight-dash 3s linear infinite" }}
        />
        <path
          d="M 60 280 Q 180 220 260 260 T 420 240"
          stroke="#168CD8"
          strokeWidth="1"
          strokeDasharray="6 10"
          opacity="0.35"
          style={{ animation: "af-flight-dash 4s linear infinite reverse" }}
        />

        {/* Shuttlecock silhouette */}
        <g transform="translate(200, 140)" filter="url(#glow)">
          <ellipse cx="40" cy="95" rx="18" ry="8" fill="#142449" stroke="#20B6E8" strokeWidth="1" opacity="0.8" />
          <path
            d="M 40 20 L 20 90 Q 40 100 60 90 Z"
            fill="url(#swoosh-cyan)"
            opacity="0.85"
          />
          <line x1="40" y1="20" x2="40" y2="88" stroke="#20B6E8" strokeWidth="1.5" opacity="0.6" />
          <circle cx="40" cy="18" r="4" fill="#20B6E8" />
        </g>

        {/* Product tube abstract */}
        <g transform="translate(280, 200)">
          <rect x="0" y="0" width="56" height="140" rx="6" fill="#101B38" stroke="#20B6E8" strokeWidth="1" opacity="0.9" />
          <rect x="8" y="12" width="40" height="8" rx="2" fill="#20B6E8" opacity="0.6" />
          <rect x="8" y="28" width="40" height="4" rx="1" fill="#168CD8" opacity="0.4" />
          <rect x="8" y="36" width="40" height="4" rx="1" fill="#168CD8" opacity="0.3" />
          <ellipse cx="28" cy="0" rx="28" ry="8" fill="#142449" stroke="#20B6E8" strokeWidth="0.75" opacity="0.7" />
        </g>

        {/* Court line accent */}
        <line x1="40" y1="400" x2="440" y2="400" stroke="#20B6E8" strokeWidth="0.5" opacity="0.2" />
        <line x1="240" y1="360" x2="240" y2="440" stroke="#20B6E8" strokeWidth="0.5" opacity="0.15" />
      </svg>
    </div>
  );
}
