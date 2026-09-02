"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CORK,
  CX,
  explodeOffset,
  featherVanePath,
  FEATHER_COUNT,
  getFeathers,
  SKIRT_BASE_RX,
  SKIRT_BASE_Y,
  stemBase,
  THREAD_RINGS,
} from "@/components/store/shuttlecock-geometry";

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

const CALLOUTS = [
  {
    id: "feathers" as const,
    num: "01",
    title: "SELECTED GOOSE FEATHERS",
    desc: "Carefully selected feathers for consistent aerodynamic response.",
    anchorPct: { x: 52, y: 38 },
    labelPct: { x: 8, y: 28 },
    align: "left" as const,
  },
  {
    id: "geometry" as const,
    num: "02",
    title: "PRECISE FEATHER GEOMETRY",
    desc: "Consistent spacing and angle designed for stable rotation.",
    anchorPct: { x: 55, y: 48 },
    labelPct: { x: 92, y: 22 },
    align: "right" as const,
  },
  {
    id: "binding" as const,
    num: "03",
    title: "REINFORCED BINDING",
    desc: "Designed to maintain structure throughout demanding rallies.",
    anchorPct: { x: 50, y: 62 },
    labelPct: { x: 8, y: 66 },
    align: "left" as const,
  },
  {
    id: "cork" as const,
    num: "04",
    title: "PRECISION CORK BASE",
    desc: "Balanced impact response and dependable shuttle behaviour.",
    anchorPct: { x: 48, y: 78 },
    labelPct: { x: 92, y: 82 },
    align: "right" as const,
  },
];

type CalloutId = (typeof CALLOUTS)[number]["id"];

type RealShuttlecockProps = {
  explode: number;
  highlightId: CalloutId | null;
  showRings: boolean;
  time: number;
  reducedMotion: boolean;
};

function RealShuttlecock({
  explode,
  highlightId,
  showRings,
  time,
  reducedMotion,
}: RealShuttlecockProps) {
  const feathers = getFeathers().sort((a, b) => b.depth - a.depth);
  const corkOff = explodeOffset(explode, "cork");
  const bindOff = explodeOffset(explode, "binding");
  const threadOff = explodeOffset(explode, "thread");

  return (
    /* Tilt like reference photo — cork lower-left, feathers upper-right */
    <g transform="rotate(-26 200 260)">
      {/* Flight geometry rings */}
      {showRings && (
        <g opacity={0.2 + explode * 0.5}>
          {[0.9, 1, 1.08].map((s, i) => (
            <ellipse
              key={i}
              cx={CX}
              cy={248}
              rx={58 * s * (1 + explode * 0.1)}
              ry={20 * s}
              fill="none"
              stroke="#20B6E8"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity={0.45 - i * 0.1}
            />
          ))}
        </g>
      )}

      {/* Feathers — back to front */}
      <g filter={highlightId === "feathers" || highlightId === "geometry" ? "url(#sc-highlight)" : undefined}>
        {feathers.map(({ index, depth }) => {
          const base = stemBase(index);
          const off = explodeOffset(explode, "feather", index);
          const tipAngle = base.angle - Math.PI / 2;
          const stemLen = 38 + (index % 3) * 2;
          const vaneLen = 118 + (index % 4) * 4;
          const vaneW = 16 + depth * 2;
          const rotDeg = (tipAngle * 180) / Math.PI + off.rot;

          const shade = 1 - depth * 0.22;
          const fill = `rgb(${Math.round(250 * shade)}, ${Math.round(252 * shade)}, ${Math.round(255 * shade)})`;

          return (
            <g
              key={index}
              transform={`translate(${base.x + off.x} ${base.y + off.y}) rotate(${rotDeg})`}
              opacity={0.88 + (1 - depth) * 0.12}
            >
              {/* Quill stem */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={-stemLen}
                stroke="#c4b494"
                strokeWidth={1.8 - depth * 0.4}
                strokeLinecap="round"
              />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={-stemLen}
                stroke="#e8dcc8"
                strokeWidth={0.6}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Feather vane — overlapping paddle */}
              <g transform={`translate(0 ${-stemLen})`}>
                <path
                  d={featherVanePath(vaneLen, vaneW)}
                  fill={fill}
                  stroke="#cbd5e1"
                  strokeWidth="0.25"
                />
                {/* Central shaft line */}
                <line
                  x1={0}
                  y1={-4}
                  x2={0}
                  y2={-vaneLen + 8}
                  stroke="#e2e8f0"
                  strokeWidth="0.4"
                  opacity={0.5}
                />
                {/* Soft barb texture */}
                {Array.from({ length: 5 }).map((_, j) => (
                  <line
                    key={j}
                    x1={-vaneW * 0.5 + j * 2}
                    y1={-vaneLen * (0.3 + j * 0.12)}
                    x2={-vaneW * 0.2 + j * 2}
                    y2={-vaneLen * (0.28 + j * 0.12)}
                    stroke="#ffffff"
                    strokeWidth="0.2"
                    opacity={0.35}
                  />
                ))}
              </g>
            </g>
          );
        })}
      </g>

      {/* Thread binding rows */}
      <g
        transform={`translate(${threadOff.x} ${threadOff.y})`}
        opacity={highlightId === "binding" ? 1 : 0.92}
        filter={highlightId === "binding" ? "url(#sc-highlight)" : undefined}
      >
        {THREAD_RINGS.map((ring, ri) => (
          <g key={ri}>
            <ellipse
              cx={CX}
              cy={ring.y}
              rx={ring.rx * (1 + explode * 0.06)}
              ry={ring.ry * (1 + explode * 0.05)}
              fill="none"
              stroke="#f8fafc"
              strokeWidth="1.1"
              opacity="0.85"
            />
            {Array.from({ length: FEATHER_COUNT }).map((_, i) => {
              const a = (i / FEATHER_COUNT) * Math.PI * 2 - Math.PI / 2;
              const x = CX + Math.cos(a) * ring.rx * 0.92;
              const y = ring.y + Math.sin(a) * ring.ry * 0.55;
              return (
                <circle key={i} cx={x} cy={y} r="0.9" fill="#ffffff" opacity="0.7" />
              );
            })}
          </g>
        ))}
      </g>

      {/* Green binding band on cork (reference photo) */}
      <g transform={`translate(${bindOff.x} ${bindOff.y})`}>
        <ellipse
          cx={CX}
          cy={SKIRT_BASE_Y + 4}
          rx={SKIRT_BASE_RX + 2}
          ry={9}
          fill="#1a5240"
        />
        <ellipse
          cx={CX}
          cy={SKIRT_BASE_Y + 2}
          rx={SKIRT_BASE_RX}
          ry={7}
          fill="none"
          stroke="#2d6b52"
          strokeWidth="0.8"
          opacity="0.6"
        />
      </g>

      {/* Cork base — white hemisphere */}
      <g
        transform={`translate(${corkOff.x} ${corkOff.y})`}
        filter={highlightId === "cork" ? "url(#sc-highlight)" : undefined}
      >
        <ellipse cx={CORK.x} cy={CORK.y} rx={CORK.rx} ry={CORK.ry} fill="url(#cork-white)" />
        <ellipse cx={CORK.x} cy={CORK.y - 4} rx={CORK.rx - 4} ry={CORK.ry - 5} fill="url(#cork-shade)" opacity="0.35" />
        {/* Leather texture dots */}
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const r = (CORK.rx - 8) * (0.3 + (i % 3) * 0.22);
          return (
            <circle
              key={i}
              cx={CORK.x + Math.cos(a) * r}
              cy={CORK.y + Math.sin(a) * r * 0.45}
              r="1.1"
              fill="#d4d4cc"
              opacity="0.35"
            />
          );
        })}
        <path
          d={`M ${CORK.x - CORK.rx + 6} ${CORK.y} Q ${CORK.x} ${CORK.y + CORK.ry + 6} ${CORK.x + CORK.rx - 6} ${CORK.y}`}
          fill="none"
          stroke="#c8c8c0"
          strokeWidth="0.6"
          opacity="0.5"
        />
      </g>

      {/* Specular highlight on feathers */}
      {!reducedMotion && (
        <ellipse
          cx={CX - 30}
          cy={160}
          rx={40}
          ry={90}
          fill="url(#highlight-sweep)"
          opacity={0.12 + Math.sin(time * 0.7) * 0.04}
          transform="rotate(-15 200 200)"
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

  const enterOffset = phase === "enter" ? (1 - easeInOutCubic(local)) * 36 : 0;

  const sceneRotation =
    phase === "rotate"
      ? local * 12
      : phase === "explode" || phase === "callouts"
        ? 12
        : phase === "reconnect"
          ? 12 * (1 - easeInOutCubic(local))
          : phase === "trajectory"
            ? 12 + local * 6
            : 0;

  const trajectoryProgress = phase === "trajectory" ? easeInOutCubic(local) : 0.2;
  const showCallouts = phase === "callouts";
  const showRings = explode > 0.12 || phase === "callouts" || phase === "reconnect";
  const staticExplode = reducedMotion ? 0.28 : explode;
  const floatY = reducedMotion || phase === "enter" ? 0 : Math.sin(time * 0.55) * 4;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      setTilt({ x: dy * -4, y: dx * 5 });
    },
    [reducedMotion],
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[min(460px,60vh)] w-full max-w-[600px] items-center justify-center sm:h-[min(520px,70vh)] lg:h-[620px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,182,232,0.08)_0%,transparent_70%)]" />

      <div
        className="relative h-full w-full will-change-transform"
        style={{
          transform: reducedMotion
            ? undefined
            : `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${floatY + enterOffset}px)`,
          transition: reducedMotion ? undefined : "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg viewBox="0 0 400 440" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="cork-white" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f4f4ee" />
              <stop offset="100%" stopColor="#e8e8e0" />
            </radialGradient>
            <radialGradient id="cork-shade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="highlight-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#20B6E8" stopOpacity="0" />
              <stop offset="35%" stopColor="#20B6E8" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#168CD8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#20B6E8" stopOpacity="0" />
            </linearGradient>
            <filter id="sc-highlight">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#20B6E8" floodOpacity="0.45" />
            </filter>
            <filter id="sc-shadow">
              <feDropShadow dx="4" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Aero Feather logo-inspired orbital swoosh */}
          <ellipse
            cx={200}
            cy={235}
            rx={155}
            ry={54}
            fill="none"
            stroke="url(#orbit-grad)"
            strokeWidth={phase === "trajectory" ? 2.4 : 1.5}
            transform={`rotate(-22 200 235) rotate(${sceneRotation * 0.3} 200 235)`}
            strokeDasharray="430"
            strokeDashoffset={430 - trajectoryProgress * 430}
            opacity={0.4 + trajectoryProgress * 0.45}
            strokeLinecap="round"
          />

          <ellipse cx={200} cy={400} rx={55} ry={8} fill="#20B6E8" opacity="0.1" />

          <g filter="url(#sc-shadow)" transform={`rotate(${sceneRotation} 200 260)`}>
            <RealShuttlecock
              explode={staticExplode}
              highlightId={hoveredCallout}
              showRings={showRings}
              time={time}
              reducedMotion={reducedMotion}
            />
          </g>
        </svg>
      </div>

      {(showCallouts || reducedMotion) && (
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {CALLOUTS.map((c, i) => {
            const stagger = showCallouts
              ? easeInOutCubic(Math.min(1, Math.max(0, local * 3 - i * 0.3)))
              : reducedMotion
                ? 0.55
                : 0;
            const active = hoveredCallout === c.id;
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
                    opacity={active ? 0.8 : 0.4}
                  />
                </svg>
                <div
                  className={cn(
                    "absolute max-w-[138px] rounded border px-2.5 py-2 backdrop-blur-sm transition-all duration-300",
                    active
                      ? "border-af-cyan/50 bg-af-surface/95 shadow-[0_0_20px_rgba(32,182,232,0.12)]"
                      : "border-af-cyan/20 bg-af-bg/85",
                  )}
                  style={{
                    left: `${c.labelPct.x}%`,
                    top: `${c.labelPct.y}%`,
                    transform: c.align === "right" ? "translateX(-100%)" : undefined,
                  }}
                >
                  <p className="text-[8px] font-bold leading-tight tracking-[0.1em] text-af-cyan">
                    {c.num} — {c.title}
                  </p>
                  <p className="mt-1 text-[7px] leading-snug text-af-muted">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
