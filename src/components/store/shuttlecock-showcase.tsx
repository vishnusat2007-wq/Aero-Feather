"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CALLOUTS,
  CYCLE,
  easeOutCubic,
  getBloom,
  getHeroStage,
  getHighlight,
  getPhase,
  getSceneRotation,
  getTrajectoryProgress,
  type HeroStage,
  type HighlightTarget,
} from "@/components/store/shuttlecock-timeline";

export type { HeroStage };

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Highlight ring positions (% of shuttle image box) for vertical product photo */
const HIGHLIGHT_ZONES: Record<
  NonNullable<HighlightTarget>,
  { top: number; left: number; width: number; height: number; shape: "ellipse" | "arc" }
> = {
  feathers: { top: 8, left: 18, width: 64, height: 38, shape: "ellipse" },
  geometry: { top: 28, left: 22, width: 56, height: 22, shape: "arc" },
  binding: { top: 48, left: 26, width: 48, height: 10, shape: "ellipse" },
  cork: { top: 58, left: 30, width: 40, height: 28, shape: "ellipse" },
};

type ShuttlecockShowcaseProps = {
  onStageChange?: (stage: HeroStage) => void;
};

export function ShuttlecockShowcase({ onStageChange }: ShuttlecockShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<HighlightTarget>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  useEffect(() => {
    onStageChange?.(getHeroStage(0));
    if (reducedMotion) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) / 1000) % CYCLE;
      setTime(t);
      onStageChange?.(getHeroStage(t));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, onStageChange]);

  const { phase, local } = getPhase(reducedMotion ? 8 : time);
  const bloom = reducedMotion ? 0.04 : getBloom(phase, local);
  const autoHighlight = getHighlight(phase, local);
  const highlight = hovered ?? autoHighlight;
  const trajectory = getTrajectoryProgress(phase, local);
  const rotationDeg = reducedMotion ? 0 : (getSceneRotation(phase, local, time) * 180) / Math.PI;
  const floatPx = reducedMotion ? 0 : Math.sin(time * 0.55) * 10;
  const enterT = phase === "flight-enter" ? 1 - easeOutCubic(local) : 0;
  const enterX = enterT * 90;
  const enterY = enterT * 50;
  const skirtScale = 1 + bloom * 0.85;

  const showPartLabels =
    phase === "explain" || phase === "open" || (reducedMotion && highlight !== null);
  const activeCallout = CALLOUTS.find((c) => c.id === highlight) ?? null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTilt({
        x: (e.clientY - (rect.top + rect.height / 2)) / rect.height,
        y: (e.clientX - (rect.left + rect.width / 2)) / rect.width,
      });
    },
    [reducedMotion],
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[min(520px,68vh)] w-full max-w-[480px] items-center justify-center sm:h-[min(600px,78vh)] lg:h-[680px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: "1200px" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.14)_0%,rgba(32,182,232,0.09)_35%,transparent_72%)]" />

      {/* Cyan orbital trajectory */}
      <svg
        viewBox="0 0 500 500"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="sc-orbit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#20B6E8" stopOpacity="0" />
            <stop offset="40%" stopColor="#20B6E8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#168CD8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#20B6E8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse
          cx="250"
          cy="255"
          rx="195"
          ry="72"
          fill="none"
          stroke="url(#sc-orbit)"
          strokeWidth="2"
          transform="rotate(-24 250 255)"
          strokeDasharray="480"
          strokeDashoffset={480 - trajectory * 480}
          opacity={0.4 + trajectory * 0.45}
          strokeLinecap="round"
        />
      </svg>

      {/* Photorealistic shuttlecock — full product, always visible */}
      <div
        className="relative z-20 h-[94%] w-[88%] max-w-[380px] transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `
            translate(${enterX}px, ${floatPx + enterY}px)
            rotateY(${rotationDeg + tilt.y * 8}deg)
            rotateX(${-tilt.x * 6}deg)
          `,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Bloom: skirt scales outward from cork — shuttle stays assembled */}
        <div
          className="relative h-full w-full"
          style={{
            transform: `scale(${skirtScale})`,
            transformOrigin: "50% 72%",
            transition: reducedMotion ? undefined : "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <Image
            src="/shuttlecock-hero-transparent.png"
            alt="Premium goose-feather badminton shuttlecock"
            width={768}
            height={1152}
            priority
            className="h-full w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] dark:drop-shadow-[0_28px_56px_rgba(0,0,0,0.65)]"
            style={{
              filter:
                "brightness(1.04) contrast(1.06) drop-shadow(0 0 32px rgba(32,182,232,0.12))",
            }}
          />

          {/* Part highlight rings */}
          {highlight && HIGHLIGHT_ZONES[highlight] && (
            <div
              className="pointer-events-none absolute animate-af-glow rounded-full border-2 border-af-cyan/70 shadow-[0_0_24px_rgba(32,182,232,0.45)]"
              style={{
                top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                borderRadius: HIGHLIGHT_ZONES[highlight].shape === "ellipse" ? "50%" : "8px",
              }}
            />
          )}

          {/* Geometry arcs when explaining skirt shape */}
          {highlight === "geometry" && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              {[32, 40, 48].map((y, i) => (
                <ellipse
                  key={y}
                  cx="50%"
                  cy={`${y}%`}
                  rx={`${22 + i * 4}%`}
                  ry="3%"
                  fill="none"
                  stroke="#20B6E8"
                  strokeWidth="1"
                  opacity={0.55 - i * 0.12}
                  strokeDasharray="4 4"
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Active part description */}
      {showPartLabels && activeCallout && (
        <div className="pointer-events-none absolute inset-0 z-30">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <line
              x1={`${activeCallout.anchorPct.x}%`}
              y1={`${activeCallout.anchorPct.y}%`}
              x2={`${activeCallout.labelPct.x}%`}
              y2={`${activeCallout.labelPct.y}%`}
              stroke="#20B6E8"
              strokeWidth="1"
              opacity="0.8"
            />
            <circle
              cx={`${activeCallout.anchorPct.x}%`}
              cy={`${activeCallout.anchorPct.y}%`}
              r="4"
              fill="#20B6E8"
            />
          </svg>
          <div
            className={cn(
              "absolute hidden max-w-[160px] rounded-lg border border-af-cyan/45 bg-af-surface/95 px-3 py-2.5 shadow-[0_0_28px_rgba(32,182,232,0.2)] backdrop-blur-md sm:block",
            )}
            style={{
              left: `${activeCallout.labelPct.x}%`,
              top: `${activeCallout.labelPct.y}%`,
              transform: activeCallout.align === "right" ? "translateX(-100%)" : undefined,
            }}
          >
            <p className="text-[9px] font-bold tracking-[0.12em] text-af-cyan">
              {activeCallout.num} — {activeCallout.title}
            </p>
            <p className="mt-1 text-[8px] leading-snug text-af-muted">{activeCallout.desc}</p>
          </div>
        </div>
      )}

      {showPartLabels && activeCallout && (
        <div className="absolute bottom-3 left-1/2 z-40 w-[min(92%,300px)] -translate-x-1/2 rounded-lg border border-af-cyan/35 bg-af-surface/95 px-3 py-2 text-center shadow-lg backdrop-blur-md sm:hidden">
          <p className="text-[10px] font-bold tracking-[0.1em] text-af-cyan">
            {activeCallout.num} — {activeCallout.title}
          </p>
          <p className="mt-1 text-[9px] leading-snug text-af-muted">{activeCallout.desc}</p>
        </div>
      )}

      {!reducedMotion && (phase === "explain" || phase === "open") && (
        <div className="absolute inset-0 z-50 hidden sm:block">
          {CALLOUTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.title}
              className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.anchorPct.x}%`, top: `${c.anchorPct.y}%` }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-[2%] left-1/2 z-10 h-12 w-52 -translate-x-1/2 rounded-full bg-white/15 blur-2xl" />
    </div>
  );
}
