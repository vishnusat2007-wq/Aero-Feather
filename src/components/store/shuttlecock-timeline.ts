export type ShuttlePhase =
  | "flight-enter"
  | "rotation"
  | "open"
  | "explain"
  | "close"
  | "flight-exit";

export type HighlightTarget = "feathers" | "geometry" | "binding" | "cork" | null;

export type HeroStage = {
  num: string;
  label: string;
};

export const CYCLE = 18;

const PHASES: { end: number; phase: ShuttlePhase }[] = [
  { end: 3, phase: "flight-enter" },
  { end: 6, phase: "rotation" },
  { end: 8.5, phase: "open" },
  { end: 13, phase: "explain" },
  { end: 14.5, phase: "close" },
  { end: CYCLE, phase: "flight-exit" },
];

export function getPhase(t: number): { phase: ShuttlePhase; local: number; start: number; end: number } {
  const loop = t % CYCLE;
  let start = 0;
  for (const p of PHASES) {
    if (loop < p.end) {
      return { phase: p.phase, local: (loop - start) / (p.end - start), start, end: p.end };
    }
    start = p.end;
  }
  return { phase: "flight-exit", local: 1, start: 14.5, end: CYCLE };
}

export function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/** Bloom as 0–0.12 fraction added to splay (5–12% iris open) */
export function getBloom(phase: ShuttlePhase, local: number): number {
  switch (phase) {
    case "open":
      return easeInOutCubic(local) * 0.12;
    case "explain":
      return 0.12;
    case "close":
      return 0.12 * (1 - easeInOutCubic(local));
    default:
      return 0;
  }
}

export function getHighlight(phase: ShuttlePhase, local: number): HighlightTarget {
  if (phase === "open") {
    if (local < 0.5) return "feathers";
    return "geometry";
  }
  if (phase !== "explain") return null;
  if (local < 0.25) return "feathers";
  if (local < 0.5) return "geometry";
  if (local < 0.75) return "binding";
  return "cork";
}

export function getHeroStage(t: number): HeroStage {
  const { phase, local } = getPhase(t);
  switch (phase) {
    case "flight-enter":
    case "flight-exit":
      return { num: "01", label: "FLIGHT" };
    case "rotation":
    case "open":
      return { num: "02", label: "FEATHER" };
    case "explain":
      return local < 0.5 ? { num: "02", label: "FEATHER" } : { num: "03", label: "DURABILITY" };
    case "close":
      return { num: "04", label: "CONTROL" };
    default:
      return { num: "01", label: "FLIGHT" };
  }
}

export function getSceneRotation(phase: ShuttlePhase, local: number, time: number): number {
  switch (phase) {
    case "flight-enter":
      return easeOutCubic(local) * 0.4;
    case "rotation":
      return 0.4 + local * Math.PI * 0.55;
    case "open":
    case "explain":
      return 0.4 + Math.PI * 0.55;
    case "close":
      return 0.4 + Math.PI * 0.55 * (1 - local * 0.3);
    case "flight-exit":
      return 0.4 + Math.PI * 0.55 + local * 0.35;
    default:
      return time * 0.1;
  }
}

export function getEnterOffset(phase: ShuttlePhase, local: number): [number, number, number] {
  if (phase !== "flight-enter") return [0, 0, 0];
  const e = 1 - easeOutCubic(local);
  return [0.55 * e, 0.18 * e, -0.35 * e];
}

export function getTrajectoryProgress(phase: ShuttlePhase, local: number): number {
  if (phase === "flight-enter") return easeOutCubic(local) * 0.35;
  if (phase === "flight-exit") return 0.35 + easeInOutCubic(local) * 0.65;
  return 0.35;
}

export const CALLOUTS = [
  {
    id: "feathers" as const,
    num: "01",
    title: "SELECTED GOOSE FEATHERS",
    desc: "Carefully selected feathers for consistent aerodynamic response.",
    anchorPct: { x: 52, y: 32 },
    labelPct: { x: 8, y: 20 },
    align: "left" as const,
  },
  {
    id: "geometry" as const,
    num: "02",
    title: "PRECISE FEATHER GEOMETRY",
    desc: "Consistent spacing and angle designed for stable rotation.",
    anchorPct: { x: 54, y: 44 },
    labelPct: { x: 92, y: 16 },
    align: "right" as const,
  },
  {
    id: "binding" as const,
    num: "03",
    title: "REINFORCED BINDING",
    desc: "Designed to maintain structure throughout demanding rallies.",
    anchorPct: { x: 50, y: 56 },
    labelPct: { x: 8, y: 58 },
    align: "left" as const,
  },
  {
    id: "cork" as const,
    num: "04",
    title: "PRECISION CORK BASE",
    desc: "Balanced impact response and dependable shuttle behaviour.",
    anchorPct: { x: 50, y: 72 },
    labelPct: { x: 92, y: 76 },
    align: "right" as const,
  },
];
