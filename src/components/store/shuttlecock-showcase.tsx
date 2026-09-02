"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  CALLOUTS,
  CYCLE,
  easeInOutCubic,
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
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-full bg-af-cyan/5" /> },
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

  const { phase, local } = getPhase(reducedMotion ? 6 : time);
  const bloom = reducedMotion ? 0.06 : getBloom(phase, local);
  const autoHighlight = getHighlight(phase, local);
  const highlight = hovered ?? autoHighlight;
  const rotationY = reducedMotion ? 0.85 : getSceneRotation(phase, local, time);
  const enterOffset = reducedMotion ? [0, 0, 0] as [number, number, number] : getEnterOffset(phase, local);
  const trajectory = getTrajectoryProgress(phase, local);
  const floatY = reducedMotion ? 0 : Math.sin(time * 0.55) * 0.012;
  const showCallouts = phase === "explain" || (reducedMotion && highlight !== null);

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
      className="relative mx-auto flex h-[min(480px,62vh)] w-full max-w-[620px] items-center justify-center sm:h-[min(540px,72vh)] lg:h-[640px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* Hero spotlight — shuttlecock brightest object */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_45%,rgba(255,255,255,0.09)_0%,rgba(32,182,232,0.07)_28%,transparent_68%)]" />

      {/* Logo-inspired cyan trajectory */}
      <svg viewBox="0 0 500 500" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
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
          cy="260"
          rx="190"
          ry="68"
          fill="none"
          stroke="url(#sc-orbit)"
          strokeWidth="2"
          transform="rotate(-24 250 260)"
          strokeDasharray="480"
          strokeDashoffset={480 - trajectory * 480}
          opacity={0.45 + trajectory * 0.4}
          strokeLinecap="round"
        />
      </svg>

      <div className="relative h-[88%] w-full">
        <ShuttlecockCanvas
          bloom={bloom}
          highlight={highlight}
          rotationY={rotationY}
          enterOffset={enterOffset}
          floatY={floatY}
          mouseTilt={tilt}
        />
      </div>

      {showCallouts && (
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {CALLOUTS.map((c, i) => {
            const active = highlight === c.id;
            const visible =
              phase === "explain"
                ? easeInOutCubic(Math.min(1, Math.max(0, local * 4 - i * 0.35)))
                : reducedMotion
                  ? 0.5
                  : 0;
            if (visible <= 0 && !active) return null;
            return (
              <div key={c.id} style={{ opacity: active ? 1 : visible * 0.85 }}>
                <svg className="absolute inset-0 h-full w-full" aria-hidden>
                  <line
                    x1={`${c.anchorPct.x}%`}
                    y1={`${c.anchorPct.y}%`}
                    x2={`${c.labelPct.x}%`}
                    y2={`${c.labelPct.y}%`}
                    stroke="#20B6E8"
                    strokeWidth={active ? 1 : 0.5}
                    opacity={active ? 0.85 : 0.4}
                  />
                </svg>
                <div
                  className={cn(
                    "absolute max-w-[140px] rounded border px-2.5 py-2 backdrop-blur-sm",
                    active
                      ? "border-af-cyan/50 bg-af-surface/95 shadow-[0_0_24px_rgba(32,182,232,0.14)]"
                      : "border-af-cyan/20 bg-af-bg/88",
                  )}
                  style={{
                    left: `${c.labelPct.x}%`,
                    top: `${c.labelPct.y}%`,
                    transform: c.align === "right" ? "translateX(-100%)" : undefined,
                  }}
                >
                  <p className="text-[8px] font-bold tracking-[0.1em] text-af-cyan">
                    {c.num} — {c.title}
                  </p>
                  <p className="mt-1 text-[7px] leading-snug text-af-muted">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!reducedMotion && phase === "explain" && (
        <div className="absolute inset-0 hidden sm:block">
          {CALLOUTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.title}
              className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.anchorPct.x}%`, top: `${c.anchorPct.y}%` }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-[4%] left-1/2 h-8 w-44 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
