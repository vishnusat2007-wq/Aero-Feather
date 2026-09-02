"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CALLOUTS,
  CYCLE,
  getBloom,
  getEnterOffset,
  getHeroStage,
  getHighlight,
  getPhase,
  getSceneRotation,
  getTrajectoryProgress,
  type HeroStage,
  type HighlightTarget,
} from "@/components/store/shuttlecock-timeline";

const ShuttlecockCanvas = dynamic(
  () => import("@/components/store/shuttlecock-canvas").then((m) => m.ShuttlecockCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-48 w-48 animate-pulse rounded-full bg-af-cyan/10" />
      </div>
    ),
  },
);

export type { HeroStage };

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
  const bloom = reducedMotion ? 0.06 : getBloom(phase, local);
  const autoHighlight = getHighlight(phase, local);
  const highlight = hovered ?? autoHighlight;
  const trajectory = getTrajectoryProgress(phase, local);
  const rotationY = reducedMotion ? 0.9 : getSceneRotation(phase, local, time);
  const enterOffset = reducedMotion ? ([0, 0, 0] as [number, number, number]) : getEnterOffset(phase, local);
  const floatY = reducedMotion ? 0 : Math.sin(time * 0.55) * 0.015;

  const showPartLabels =
    phase === "explain" ||
    phase === "open" ||
    (reducedMotion && highlight !== null);

  const activeCallout = CALLOUTS.find((c) => c.id === highlight) ?? null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      setTilt({ x: dy, y: dx });
    },
    [reducedMotion],
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[min(500px,65vh)] w-full max-w-[640px] items-center justify-center sm:h-[min(560px,75vh)] lg:h-[660px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.11)_0%,rgba(32,182,232,0.08)_32%,transparent_70%)]" />

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

      {/* Animated 3D shuttlecock — full product always visible */}
      <div className="relative z-20 h-[92%] w-full min-h-[320px]">
        <ShuttlecockCanvas
          bloom={bloom}
          highlight={highlight}
          rotationY={rotationY}
          enterOffset={enterOffset}
          floatY={floatY}
          mouseTilt={tilt}
        />
      </div>

      {/* Active part description — synced to highlight */}
      {showPartLabels && activeCallout && (
        <div className="pointer-events-none absolute inset-0 z-30">
          {/* Connector line */}
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <line
              x1={`${activeCallout.anchorPct.x}%`}
              y1={`${activeCallout.anchorPct.y}%`}
              x2={`${activeCallout.labelPct.x}%`}
              y2={`${activeCallout.labelPct.y}%`}
              stroke="#20B6E8"
              strokeWidth="1"
              opacity="0.75"
            />
            <circle
              cx={`${activeCallout.anchorPct.x}%`}
              cy={`${activeCallout.anchorPct.y}%`}
              r="4"
              fill="#20B6E8"
              opacity="0.85"
            />
          </svg>

          {/* Hotspot pulse on active component */}
          <div
            className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-af-glow rounded-full border border-af-cyan/40 bg-af-cyan/10"
            style={{
              left: `${activeCallout.anchorPct.x}%`,
              top: `${activeCallout.anchorPct.y}%`,
            }}
          />

          {/* Description card — desktop */}
          <div
            className={cn(
              "absolute hidden max-w-[155px] rounded-lg border border-af-cyan/45 bg-af-surface/95 px-3 py-2.5 shadow-[0_0_28px_rgba(32,182,232,0.18)] backdrop-blur-md sm:block",
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

      {/* Mobile part description */}
      {showPartLabels && activeCallout && (
        <div className="absolute bottom-2 left-1/2 z-40 w-[min(92%,280px)] -translate-x-1/2 rounded-lg border border-af-cyan/35 bg-af-surface/95 px-3 py-2 text-center shadow-lg backdrop-blur-md sm:hidden">
          <p className="text-[10px] font-bold tracking-[0.1em] text-af-cyan">
            {activeCallout.num} — {activeCallout.title}
          </p>
          <p className="mt-1 text-[9px] leading-snug text-af-muted">{activeCallout.desc}</p>
        </div>
      )}

      {/* Hover targets during explain */}
      {!reducedMotion && (phase === "explain" || phase === "open") && (
        <div className="absolute inset-0 z-50 hidden sm:block">
          {CALLOUTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.title}
              className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${c.anchorPct.x}%`, top: `${c.anchorPct.y}%` }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-[3%] left-1/2 z-10 h-10 w-48 -translate-x-1/2 rounded-full bg-white/12 blur-2xl" />
    </div>
  );
}
