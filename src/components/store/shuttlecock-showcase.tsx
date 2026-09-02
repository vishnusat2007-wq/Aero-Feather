"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const LABELS = [
  { text: "STABLE FLIGHT", angle: -55, radius: 155, anchor: "feathers" },
  { text: "GOOSE FEATHER", angle: 145, radius: 165, anchor: "feathers" },
  { text: "TOURNAMENT GRADE", angle: 35, radius: 175, anchor: "cork" },
  { text: "HIGH DURABILITY", angle: -145, radius: 160, anchor: "cork" },
] as const;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

function ShuttlecockSvg({ highlight }: { highlight: number }) {
  return (
    <svg viewBox="0 0 200 320" className="h-full w-full drop-shadow-2xl" aria-hidden>
      <defs>
        <radialGradient id="sc-glow" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#20B6E8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#20B6E8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="feather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="feather-shade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="cork-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="50%" stopColor="#b8956a" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id="highlight-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${highlight}%`} stopColor="#ffffff" stopOpacity="0" />
          <stop offset={`${Math.min(highlight + 8, 100)}%`} stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset={`${Math.min(highlight + 16, 100)}%`} stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="sc-soft-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground glow */}
      <ellipse cx="100" cy="290" rx="55" ry="12" fill="url(#sc-glow)" />

      {/* Feathers — left */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={`fl-${i}`}
          d={`M100 ${48 + i * 2} Q${55 - i * 3} ${90 + i * 18} ${72 - i} ${200 + i * 4} Q100 ${210 + i * 2} ${100} ${200}`}
          fill="url(#feather-grad)"
          opacity={0.92 - i * 0.04}
          stroke="#94a3b8"
          strokeWidth="0.3"
        />
      ))}
      {/* Feathers — right */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={`fr-${i}`}
          d={`M100 ${48 + i * 2} Q${145 + i * 3} ${90 + i * 18} ${128 + i} ${200 + i * 4} Q100 ${210 + i * 2} ${100} ${200}`}
          fill="url(#feather-shade)"
          opacity={0.88 - i * 0.04}
          stroke="#64748b"
          strokeWidth="0.3"
        />
      ))}

      {/* Highlight sweep overlay */}
      <path
        d="M100 40 Q60 120 75 210 Q100 220 100 200 Q125 210 140 120 Q100 40 100 40"
        fill="url(#highlight-sweep)"
        opacity="0.6"
      />

      {/* Stem */}
      <line x1="100" y1="200" x2="100" y2="248" stroke="#8b7355" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1="200" x2="100" y2="248" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Cork base */}
      <ellipse cx="100" cy="258" rx="22" ry="9" fill="url(#cork-grad)" filter="url(#sc-soft-glow)" />
      <ellipse cx="100" cy="255" rx="18" ry="6" fill="#c9a66b" opacity="0.5" />
      <path d="M78 258 Q100 268 122 258" fill="none" stroke="#6b5344" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

export function ShuttlecockShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [highlight, setHighlight] = useState(30);
  const [labelPhase, setLabelPhase] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      setHighlight(20 + ((Math.sin(t * 0.4) + 1) / 2) * 60);
      setLabelPhase(t);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setTilt({ x: dy * -8, y: dx * 10 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const floatClass = reducedMotion ? "" : "animate-shuttle-float";
  const rotateClass = reducedMotion ? "" : "animate-shuttle-rotate";

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[min(420px,55vh)] w-full max-w-[560px] items-center justify-center sm:h-[min(480px,65vh)] lg:h-[580px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Radial backdrop */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(32,182,232,0.12)_0%,transparent_65%)]" />

      {/* Flight path swoosh — logo inspired */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#20B6E8" stopOpacity="0" />
            <stop offset="30%" stopColor="#20B6E8" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#168CD8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#20B6E8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 40 320 Q 120 80 280 120 T 460 200"
          fill="none"
          stroke="url(#path-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          className={reducedMotion ? "" : "animate-flight-path"}
          opacity="0.55"
        />
        <path
          d="M 60 360 Q 180 140 300 160 T 440 240"
          fill="none"
          stroke="#168CD8"
          strokeWidth="1"
          strokeDasharray="4 8"
          className={reducedMotion ? "" : "animate-flight-dash-slow"}
          opacity="0.25"
        />
        {/* Court geometry — faint */}
        <line x1="50" y1="420" x2="450" y2="420" stroke="#20B6E8" strokeWidth="0.5" opacity="0.08" />
        <line x1="250" y1="380" x2="250" y2="460" stroke="#20B6E8" strokeWidth="0.5" opacity="0.06" />
      </svg>

      {/* Particles — hidden on small screens for performance */}
      {!reducedMotion &&
        Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute hidden h-1 w-1 rounded-full bg-af-cyan/60 animate-particle sm:block"
            style={{
              left: `${20 + i * 9}%`,
              top: `${30 + (i % 3) * 18}%`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}

      {/* Orbital labels */}
      {LABELS.map((label, i) => {
        const angleRad = ((label.angle + (reducedMotion ? 0 : labelPhase * 8)) * Math.PI) / 180;
        const x = 50 + Math.cos(angleRad) * (label.radius / 5.5);
        const y = 50 + Math.sin(angleRad) * (label.radius / 5.8);
        const opacity = reducedMotion
          ? 0.7
          : 0.35 + ((Math.sin(labelPhase * 0.5 + i * 1.2) + 1) / 2) * 0.65;

        return (
          <div
            key={label.text}
            className="pointer-events-none absolute z-20 hidden transition-opacity duration-700 sm:block"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              opacity,
            }}
          >
            <svg
              className="absolute left-1/2 top-1/2 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2"
              aria-hidden
            >
              <line
                x1="50%"
                y1="50%"
                x2={label.anchor === "feathers" ? "55%" : "45%"}
                y2={label.anchor === "feathers" ? "65%" : "75%"}
                stroke="#20B6E8"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </svg>
            <span className="whitespace-nowrap text-[9px] font-semibold tracking-[0.18em] text-af-cyan/90 uppercase sm:text-[10px]">
              {label.text}
            </span>
          </div>
        );
      })}

      {/* Shuttlecock */}
      <div
        className={cn(
          "relative z-10 h-[72%] w-[55%] will-change-transform",
          floatClass,
          rotateClass,
        )}
        style={{
          transform: reducedMotion
            ? undefined
            : `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: reducedMotion ? undefined : "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <ShuttlecockSvg highlight={highlight} />
      </div>

      {/* Under-glow */}
      <div className="absolute bottom-[8%] left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-af-cyan/20 blur-2xl animate-af-glow" />
    </div>
  );
}
