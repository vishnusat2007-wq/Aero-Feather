"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const CYCLE = 16;

export type HeroStage = {
  num: string;
  label: string;
};

export function getHeroStage(t: number): HeroStage {
  const loop = t % CYCLE;
  if (loop < 5) return { num: "01", label: "FLIGHT" };
  if (loop < 8) return { num: "02", label: "FEATHER" };
  if (loop < 11) return { num: "03", label: "DURABILITY" };
  if (loop < 14) return { num: "04", label: "CONTROL" };
  return { num: "01", label: "FLIGHT" };
}

type Phase =
  | "enter"
  | "rotate"
  | "explode"
  | "callouts"
  | "reconnect"
  | "trajectory";

function getPhase(t: number): { phase: Phase; local: number } {
  const loop = t % CYCLE;
  if (loop < 2) return { phase: "enter", local: loop / 2 };
  if (loop < 5) return { phase: "rotate", local: (loop - 2) / 3 };
  if (loop < 8) return { phase: "explode", local: (loop - 5) / 3 };
  if (loop < 11) return { phase: "callouts", local: (loop - 8) / 3 };
  if (loop < 14) return { phase: "reconnect", local: (loop - 11) / 3 };
  return { phase: "trajectory", local: (loop - 14) / 2 };
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const FEATHER_COUNT = 16;
const APEX = { x: 200, y: 95 };
const SKIRT_Y = 268;
const SKIRT_RX = 78;

const CALLOUTS = [
  {
    id: "feathers" as const,
    num: "01",
    title: "SELECTED GOOSE FEATHERS",
    desc: "Carefully selected feathers for consistent aerodynamic response.",
    anchorPct: { x: 50, y: 41 },
    labelPct: { x: 14, y: 32 },
    align: "left" as const,
  },
  {
    id: "geometry" as const,
    num: "02",
    title: "PRECISE FEATHER GEOMETRY",
    desc: "Consistent spacing and angle designed for stable rotation.",
    anchorPct: { x: 50, y: 50 },
    labelPct: { x: 86, y: 26 },
    align: "right" as const,
  },
  {
    id: "binding" as const,
    num: "03",
    title: "REINFORCED BINDING",
    desc: "Designed to maintain structure throughout demanding rallies.",
    anchorPct: { x: 50, y: 63 },
    labelPct: { x: 12, y: 68 },
    align: "left" as const,
  },
  {
    id: "cork" as const,
    num: "04",
    title: "PRECISION CORK BASE",
    desc: "Balanced impact response and dependable shuttle behaviour.",
    anchorPct: { x: 50, y: 79 },
    labelPct: { x: 88, y: 84 },
    align: "right" as const,
  },
];

type CalloutId = (typeof CALLOUTS)[number]["id"];

function featherPath(index: number, spread: number) {
  const baseAngle = (index / FEATHER_COUNT) * Math.PI * 2 - Math.PI / 2;
  const extra = spread * 0.22 * Math.sin(index * 0.7);
  const angle = baseAngle + extra;
  const bx = APEX.x + Math.cos(angle) * SKIRT_RX;
  const by = SKIRT_Y + Math.sin(angle) * 18 + spread * 8;
  const tipX = APEX.x + Math.cos(angle) * 6;
  const tipY = APEX.y - spread * 6;
  const ctrlX = bx + Math.cos(angle) * (18 + spread * 12);
  const ctrlY = (tipY + by) / 2;
  return `M ${tipX} ${tipY} Q ${ctrlX} ${ctrlY} ${bx} ${by} Q ${APEX.x} ${(tipY + by) / 2} ${tipX} ${tipY}`;
}

type ShuttlecockSceneProps = {
  time: number;
  explode: number;
  rotation: number;
  enterOffset: number;
  highlightId: CalloutId | null;
  showRings: boolean;
  reducedMotion: boolean;
};

function ShuttlecockScene({
  time,
  explode,
  rotation,
  enterOffset,
  highlightId,
  showRings,
  reducedMotion,
}: ShuttlecockSceneProps) {
  const corkDrop = explode * 42;
  const bindingDrop = explode * 22;
  const bindingScale = 1 + explode * 0.08;

  return (
    <g transform={`rotate(${rotation} 200 250) translate(0 ${enterOffset})`}>
      {showRings && (
        <g opacity={0.25 + explode * 0.45}>
          {[0.85, 1, 1.15].map((scale, i) => (
            <ellipse
              key={i}
              cx={200}
              cy={SKIRT_Y - 10}
              rx={SKIRT_RX * scale * (1 + explode * 0.12)}
              ry={22 * scale * (1 + explode * 0.1)}
              fill="none"
              stroke="#20B6E8"
              strokeWidth="0.6"
              strokeDasharray="3 5"
              opacity={0.5 - i * 0.12}
            />
          ))}
          <line x1={122} y1={SKIRT_Y - 10} x2={278} y2={SKIRT_Y - 10} stroke="#20B6E8" strokeWidth="0.4" opacity="0.3" />
        </g>
      )}

      <g
        opacity={highlightId === "feathers" || highlightId === "geometry" ? 1 : 0.96}
        filter={highlightId === "feathers" ? "url(#sc-highlight)" : undefined}
      >
        {Array.from({ length: FEATHER_COUNT }).map((_, i) => (
          <path
            key={i}
            d={featherPath(i, explode)}
            fill={i % 2 === 0 ? "#e8edf2" : "#b8c4d0"}
            stroke="#94a3b8"
            strokeWidth="0.35"
            opacity={0.92 - (i % 4) * 0.04}
          />
        ))}
        {Array.from({ length: FEATHER_COUNT }).map((_, i) => (
          <path
            key={`inner-${i}`}
            d={featherPath(i, explode * 0.85)}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.25"
            opacity={0.15}
          />
        ))}
      </g>

      <g
        transform={`translate(0 ${bindingDrop}) scale(${bindingScale})`}
        opacity={highlightId === "binding" ? 1 : 0.95}
        filter={highlightId === "binding" ? "url(#sc-highlight)" : undefined}
      >
        <ellipse cx={200} cy={SKIRT_Y + 8} rx={52} ry={10} fill="#8b7355" opacity="0.85" />
        <ellipse cx={200} cy={SKIRT_Y + 6} rx={48} ry={7} fill="none" stroke="#c4a574" strokeWidth="1.2" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={200 + Math.cos(a) * 44}
              y1={SKIRT_Y + 6 + Math.sin(a) * 5}
              x2={200 + Math.cos(a) * 52}
              y2={SKIRT_Y + 8 + Math.sin(a) * 7}
              stroke="#d4b896"
              strokeWidth="0.4"
              opacity="0.6"
            />
          );
        })}
      </g>

      <line
        x1={200}
        y1={SKIRT_Y + 14 + bindingDrop}
        x2={200}
        y2={318 + corkDrop * 0.5}
        stroke="#9a8060"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={200}
        y1={SKIRT_Y + 14 + bindingDrop}
        x2={200}
        y2={318 + corkDrop * 0.5}
        stroke="#d4a574"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      <g
        transform={`translate(0 ${corkDrop})`}
        filter={highlightId === "cork" ? "url(#sc-highlight)" : undefined}
      >
        <ellipse cx={200} cy={348} rx={34} ry={14} fill="url(#cork-grad)" />
        <ellipse cx={200} cy={344} rx={28} ry={9} fill="#c9a66b" opacity="0.45" />
        <path d="M 166 348 Q 200 362 234 348" fill="none" stroke="#6b5344" strokeWidth="0.8" opacity="0.45" />
      </g>

      {!reducedMotion && (
        <path
          d="M 200 100 Q 140 200 160 280 Q 200 290 240 280 Q 260 200 200 100"
          fill="url(#highlight-sweep)"
          opacity={0.35 + Math.sin(time * 0.8) * 0.1}
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </g>
  );
}

type ShuttlecockShowcaseProps = {
  onStageChange?: (stage: HeroStage) => void;
};

export function ShuttlecockShowcase({ onStageChange }: ShuttlecockShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredCallout, setHoveredCallout] = useState<CalloutId | null>(null);
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

  const { phase, local } = getPhase(time);
  const explode =
    phase === "explode"
      ? easeInOutCubic(local)
      : phase === "callouts"
        ? 1
        : phase === "reconnect"
          ? 1 - easeInOutCubic(local)
          : 0;

  const enterOffset = phase === "enter" ? (1 - easeInOutCubic(local)) * 40 : 0;

  const rotation =
    phase === "rotate"
      ? local * 18
      : phase === "explode" || phase === "callouts"
        ? 18
        : phase === "reconnect"
          ? 18 * (1 - easeInOutCubic(local))
          : phase === "trajectory"
            ? 18 + local * 8
            : 0;

  const trajectoryProgress =
    phase === "trajectory" ? easeInOutCubic(local) : 0.25;

  const showCallouts = phase === "callouts";
  const showRings = explode > 0.15 || phase === "callouts" || phase === "reconnect";
  const staticExplode = reducedMotion ? 0.3 : explode;
  const highlightId = hoveredCallout;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      setTilt({ x: dy * -5, y: dx * 6 });
    },
    [reducedMotion],
  );

  const floatY = reducedMotion || phase === "enter" ? 0 : Math.sin(time * 0.6) * 5;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[min(440px,58vh)] w-full max-w-[580px] items-center justify-center sm:h-[min(500px,68vh)] lg:h-[600px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,182,232,0.1)_0%,transparent_68%)]" />

      <div
        className="relative h-full w-full will-change-transform"
        style={{
          transform: reducedMotion
            ? undefined
            : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${floatY}px)`,
          transition: reducedMotion ? undefined : "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg viewBox="0 0 400 440" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="cork-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="50%" stopColor="#b8956a" />
              <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
            <linearGradient id="highlight-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#20B6E8" stopOpacity="0" />
              <stop offset="35%" stopColor="#20B6E8" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#168CD8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#20B6E8" stopOpacity="0" />
            </linearGradient>
            <filter id="sc-highlight">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#20B6E8" floodOpacity="0.5" />
            </filter>
            <filter id="sc-shadow">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>

          <ellipse
            cx={200}
            cy={230}
            rx={150}
            ry={52}
            fill="none"
            stroke="url(#orbit-grad)"
            strokeWidth={phase === "trajectory" ? 2.2 : 1.4}
            transform="rotate(-22 200 230)"
            strokeDasharray="420"
            strokeDashoffset={420 - trajectoryProgress * 420}
            opacity={0.35 + trajectoryProgress * 0.45}
            strokeLinecap="round"
          />
          <ellipse
            cx={200}
            cy={230}
            rx={130}
            ry={44}
            fill="none"
            stroke="#168CD8"
            strokeWidth="0.8"
            transform="rotate(-22 200 230)"
            opacity="0.15"
            strokeDasharray="4 8"
          />

          <ellipse cx={200} cy={390} rx={60} ry={10} fill="#20B6E8" opacity="0.12" />

          <g filter="url(#sc-shadow)">
            <ShuttlecockScene
              time={time}
              explode={staticExplode}
              rotation={reducedMotion ? 0 : rotation}
              enterOffset={reducedMotion ? 0 : enterOffset}
              highlightId={highlightId}
              showRings={showRings}
              reducedMotion={reducedMotion}
            />
          </g>
        </svg>
      </div>

      {/* HTML callout overlays */}
      {(showCallouts || reducedMotion) && (
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {CALLOUTS.map((c, i) => {
            const stagger = showCallouts
              ? easeInOutCubic(Math.min(1, Math.max(0, local * 3 - i * 0.3)))
              : reducedMotion
                ? 0.6
                : 0;
            const active = highlightId === c.id;
            return (
              <div key={c.id} style={{ opacity: stagger }}>
                <svg className="absolute inset-0 h-full w-full" aria-hidden>
                  <line
                    x1={`${c.anchorPct.x}%`}
                    y1={`${c.anchorPct.y}%`}
                    x2={`${c.labelPct.x}%`}
                    y2={`${c.labelPct.y}%`}
                    stroke="#20B6E8"
                    strokeWidth={active ? 1 : 0.5}
                    opacity={active ? 0.75 : 0.4}
                  />
                </svg>
                <div
                  className={cn(
                    "absolute max-w-[140px] rounded border px-2.5 py-2 backdrop-blur-sm transition-all duration-300",
                    c.align === "left" ? "-translate-x-0" : "-translate-x-full",
                    active
                      ? "border-af-cyan/50 bg-af-surface/95 shadow-[0_0_20px_rgba(32,182,232,0.15)]"
                      : "border-af-cyan/20 bg-af-bg/80",
                  )}
                  style={{ left: `${c.labelPct.x}%`, top: `${c.labelPct.y}%`, transform: c.align === "right" ? "translateX(-100%)" : undefined }}
                >
                  <p className="text-[8px] font-bold leading-tight tracking-[0.12em] text-af-cyan">
                    {c.num} — {c.title}
                  </p>
                  <p className="mt-1 text-[7px] leading-snug text-af-muted">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive callout targets */}
      {!reducedMotion && showCallouts && (
        <div className="absolute inset-0 hidden sm:block">
          {CALLOUTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.title}
              className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.anchorPct.x}%`, top: `${c.anchorPct.y}%` }}
              onMouseEnter={() => setHoveredCallout(c.id)}
              onMouseLeave={() => setHoveredCallout(null)}
              onFocus={() => setHoveredCallout(c.id)}
              onBlur={() => setHoveredCallout(null)}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-[6%] left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-af-cyan/15 blur-2xl" />
    </div>
  );
}
