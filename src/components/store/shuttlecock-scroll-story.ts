export type ScrollChapter =
  | "intro"
  | "feathers"
  | "geometry"
  | "binding"
  | "cork"
  | "assemble";

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
  {
    id: "assemble",
    num: "06",
    label: "ASSEMBLE",
    title: "LOCKED AS ONE",
    desc: "Cork, binding and feathers settle back into a single tournament shuttle — complete from base to tip.",
    bullets: ["One intact assembled bird", "Balanced from cork to tip", "Ready for the next rally"],
  },
];

/**
 *  0.00–0.07  assembled intro
 *  0.07–0.24  feathers lift
 *  0.24–0.40  geometry (skirt stays open)
 *  0.40–0.54  binding lifts
 *  0.54–0.68  cork
 *  0.68–1.00  assemble — every lift returns to 0
 */
const CHAPTER_BOUNDS = [0, 0.07, 0.24, 0.4, 0.54, 0.68, 1] as const;

/** Full-width layers only — side insets created the old horizontal bar. */
export const LAYER_CLIPS = {
  feathers: "inset(0% 0% 46% 0%)",
  binding: "inset(48% 0% 28% 0%)",
  cork: "inset(66% 0% 0% 0%)",
} as const;

export const HIGHLIGHT_ZONES: Record<
  Exclude<ScrollChapter, "intro" | "assemble">,
  { top: number; left: number; width: number; height: number }
> = {
  feathers: { top: 8, left: 12, width: 76, height: 34 },
  geometry: { top: 28, left: 18, width: 64, height: 20 },
  binding: { top: 50, left: 26, width: 48, height: 12 },
  cork: { top: 76, left: 32, width: 36, height: 22 },
};

export type PartCallout = {
  id: Exclude<ScrollChapter, "intro" | "assemble">;
  text: string;
  top: number;
};

export const PART_CALLOUTS: PartCallout[] = [
  { id: "feathers", text: "Feathers", top: 16 },
  { id: "geometry", text: "Geometry", top: 32 },
  { id: "binding", text: "Binding", top: 52 },
  { id: "cork", text: "Cork", top: 78 },
];

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

function ramp(p: number, a: number, b: number) {
  if (b <= a) return p >= b ? 1 : 0;
  return smootherstep((p - a) / (b - a));
}

function pulse(p: number, a: number, b: number, c: number, d: number) {
  return ramp(p, a, b) * (1 - ramp(p, c, d));
}

export function getChapterIndex(progress: number): number {
  const p = clamp01(progress);
  for (let i = CHAPTER_BOUNDS.length - 2; i >= 0; i--) {
    if (p >= CHAPTER_BOUNDS[i]) return i;
  }
  return 0;
}

export function getChapterProgress(progress: number): number {
  const p = clamp01(progress);
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

export type ScrollViewAnim = {
  imgY: number;
  imgScale: number;
  bloom: number;
  tiltY: number;
  tiltX: number;
  glow: number;
  inspect: number;
  settle: number;
  assemblingLabel: number;
  closing: boolean;
  highlight: Exclude<ScrollChapter, "intro" | "assemble"> | null;
  chapter: number;
  local: number;
  featherLift: number;
  featherSpread: number;
  bindingLift: number;
  corkDrop: number;
  corkGlow: number;
  openAmount: number;
  assembledOpacity: number;
};

/** Slight breakup on scroll; every lift is 0 at start and end. */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);

  const featherGate = pulse(p, 0.07, 0.18, 0.68, 0.9);
  const geometryBoost = pulse(p, 0.24, 0.32, 0.36, 0.5);
  const bindingGate = pulse(p, 0.38, 0.5, 0.7, 0.92);
  const corkGate = pulse(p, 0.52, 0.6, 0.72, 0.9);
  const openAmount = Math.max(featherGate, bindingGate, corkGate);
  const inspect = openAmount;
  const closing = p >= CHAPTER_BOUNDS[5];
  const settle = pulse(p, 0.8, 0.88, 0.9, 0.98);
  const assemblingLabel = pulse(p, 0.68, 0.74, 0.88, 0.96);

  const featherLift = featherGate * (42 + geometryBoost * 10);
  const featherSpread = featherGate * (0.055 + geometryBoost * 0.035);
  const bindingLift = bindingGate * 24;
  const corkDrop = corkGate * 12;
  const corkGlow = corkGate;

  const imgY = featherGate * -6 + corkGate * 5;
  const imgScale = 1 + openAmount * 0.025 + settle * 0.012;
  const tiltY = lerp(-0.4, 2.4, openAmount);
  const tiltX = -0.4 + Math.sin(p * Math.PI) * 0.7;
  const glow = Math.max(openAmount, settle * 0.8);

  const part =
    chapter === 0 || chapter === 5
      ? null
      : (CHAPTERS[chapter].id as Exclude<ScrollChapter, "intro" | "assemble">);

  return {
    imgY,
    imgScale,
    bloom: openAmount,
    tiltY,
    tiltX,
    glow,
    inspect,
    settle,
    assemblingLabel,
    closing,
    highlight: part,
    chapter,
    local,
    featherLift,
    featherSpread,
    bindingLift,
    corkDrop,
    corkGlow,
    openAmount,
    assembledOpacity: 1 - openAmount,
  };
}

export function getCloseIntegrity(progress: number) {
  const anim = getScrollAnim(progress);
  return {
    intact: anim.featherLift < 0.4 && anim.bindingLift < 0.4 && anim.corkDrop < 0.4,
    atRest: Math.abs(anim.imgY) < 0.05 && Math.abs(anim.imgScale - 1) < 0.01,
    closing: anim.closing,
  };
}
