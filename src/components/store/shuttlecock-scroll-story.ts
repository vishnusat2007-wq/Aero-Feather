export type ScrollChapter = "intro" | "feathers" | "geometry" | "binding" | "cork";

export type HeroStage = { num: string; label: string };

export type ChapterInfo = {
  id: ScrollChapter;
  num: string;
  label: string;
  title: string;
  desc: string;
  bullets: string[];
};

export const CHAPTERS: ChapterInfo[] = [
  {
    id: "intro",
    num: "01",
    label: "FLIGHT",
    title: "TOURNAMENT SHUTTLECOCK",
    desc: "A complete premium goose-feather shuttlecock — engineered for stable flight from cork to tip.",
    bullets: ["16 goose feathers", "Natural cork base", "Tournament grade"],
  },
  {
    id: "feathers",
    num: "02",
    label: "FEATHER",
    title: "SELECTED GOOSE FEATHERS",
    desc: "Sixteen overlapping natural feathers flare outward for aerodynamic stability and consistent rotation.",
    bullets: ["Hand-selected grade A feathers", "Overlapping skirt cone", "Stable in-flight rotation"],
  },
  {
    id: "geometry",
    num: "03",
    label: "GEOMETRY",
    title: "PRECISE FEATHER GEOMETRY",
    desc: "Uniform spacing and skirt angle maintain predictable flight path through every rally.",
    bullets: ["Calibrated skirt angle", "Even feather spacing", "Predictable trajectory"],
  },
  {
    id: "binding",
    num: "04",
    label: "DURABILITY",
    title: "REINFORCED BINDING",
    desc: "Double thread rows lock the feather stems — built to survive demanding club and tournament play.",
    bullets: ["Twin thread rows", "Stem-lock weave", "Extended rally life"],
  },
  {
    id: "cork",
    num: "05",
    label: "CONTROL",
    title: "PRECISION CORK BASE",
    desc: "Natural cork base delivers balanced impact response and dependable shuttle behaviour on every hit.",
    bullets: ["Natural cork hemisphere", "Weighted flight balance", "Consistent impact feel"],
  },
];

/**
 * Scroll story:
 *  0.00–0.08  assembled intro
 *  0.08–0.28  feathers lift
 *  0.28–0.46  geometry
 *  0.46–0.62  binding
 *  0.62–0.74  cork (held open)
 *  0.74–1.00  close — every part returns to a complete shuttle
 */
const CHAPTER_BOUNDS = [0, 0.08, 0.28, 0.46, 0.62, 0.78, 1] as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smootherstep(t: number) {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** 0→1 between [a,b], 0 before, 1 after */
function ramp(p: number, a: number, b: number) {
  if (b <= a) return p >= b ? 1 : 0;
  return smootherstep((p - a) / (b - a));
}

/** Envelope that rises then falls back to 0 (open then close). */
function openClose(p: number, riseA: number, riseB: number, fallA: number, fallB: number) {
  return ramp(p, riseA, riseB) * (1 - ramp(p, fallA, fallB));
}

export function getChapterIndex(progress: number): number {
  const p = clamp01(progress);
  if (p < CHAPTER_BOUNDS[1]) return 0;
  if (p < CHAPTER_BOUNDS[2]) return 1;
  if (p < CHAPTER_BOUNDS[3]) return 2;
  if (p < CHAPTER_BOUNDS[4]) return 3;
  if (p < CHAPTER_BOUNDS[5]) return 4;
  return 0;
}

export function getChapterProgress(progress: number): number {
  const p = clamp01(progress);
  if (p >= CHAPTER_BOUNDS[5]) {
    return ramp(p, CHAPTER_BOUNDS[5], 1);
  }
  const idx = getChapterIndex(p);
  const start = CHAPTER_BOUNDS[idx];
  const end = CHAPTER_BOUNDS[idx + 1] ?? 1;
  if (end === start) return 1;
  return clamp01((p - start) / (end - start));
}

export function getHeroStage(progress: number): HeroStage {
  const c = CHAPTERS[getChapterIndex(progress)];
  return { num: c.num, label: c.label };
}

export const HIGHLIGHT_ZONES: Record<
  Exclude<ScrollChapter, "intro">,
  { top: number; left: number; width: number; height: number }
> = {
  feathers: { top: 4, left: 14, width: 72, height: 42 },
  geometry: { top: 22, left: 18, width: 64, height: 26 },
  binding: { top: 44, left: 22, width: 56, height: 14 },
  cork: { top: 54, left: 26, width: 48, height: 36 },
};

export type PartCallout = {
  id: Exclude<ScrollChapter, "intro">;
  anchorPct: { x: number; y: number };
  labelPct: { x: number; y: number };
  align: "left" | "right";
};

export const PART_CALLOUTS: PartCallout[] = [
  { id: "feathers", anchorPct: { x: 50, y: 20 }, labelPct: { x: 50, y: 92 }, align: "left" },
  { id: "geometry", anchorPct: { x: 50, y: 36 }, labelPct: { x: 50, y: 92 }, align: "left" },
  { id: "binding", anchorPct: { x: 50, y: 50 }, labelPct: { x: 50, y: 92 }, align: "left" },
  { id: "cork", anchorPct: { x: 50, y: 74 }, labelPct: { x: 50, y: 92 }, align: "left" },
];

export type ScrollViewAnim = {
  focusY: number;
  focusScale: number;
  tiltY: number;
  tiltX: number;
  featherLift: number;
  featherSpread: number;
  bindingLift: number;
  corkGlow: number;
  openAmount: number;
  assembledOpacity: number;
  closing: boolean;
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
};

/** Continuous open → inspect → close. Start and end are a complete shuttle. */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);

  const openAmount = openClose(p, 0.06, 0.34, 0.72, 0.97);
  const closing = p >= 0.72;

  const featherGate = openClose(p, 0.07, 0.22, 0.73, 0.97);
  const geometryBoost = openClose(p, 0.26, 0.38, 0.42, 0.58);
  const featherLift = featherGate * (68 + geometryBoost * 36);
  const featherSpread = featherGate * (0.09 + geometryBoost * 0.1);

  const bindingLift = openClose(p, 0.38, 0.54, 0.74, 0.97) * 72;
  const corkGlow = openClose(p, 0.58, 0.68, 0.78, 0.94);

  const focusY = openAmount * 26;
  const focusScale = 1 + openAmount * 0.035;
  const tiltY = lerp(-1.2, 2.6, openAmount);
  const tiltX = -0.8 + Math.sin(p * Math.PI) * 1.1;

  // Intact photo: hidden while exploded, covers slices again as they close
  const closeCover = ramp(p, 0.70, 0.92);
  const assembledOpacity = Math.max(
    1 - smootherstep((openAmount - 0.03) / 0.28),
    closeCover,
  );

  const highlight: ScrollChapter | null =
    closing || chapter === 0 ? null : CHAPTERS[chapter].id;

  return {
    focusY,
    focusScale,
    tiltY,
    tiltX,
    featherLift,
    featherSpread,
    bindingLift,
    corkGlow,
    openAmount,
    assembledOpacity,
    closing,
    highlight,
    chapter,
    local,
  };
}
