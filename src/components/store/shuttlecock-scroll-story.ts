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

const CHAPTER_BOUNDS = [0, 0.08, 0.26, 0.44, 0.60, 0.76, 1] as const;

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
  if (p < CHAPTER_BOUNDS[1]) return 0;
  if (p < CHAPTER_BOUNDS[2]) return 1;
  if (p < CHAPTER_BOUNDS[3]) return 2;
  if (p < CHAPTER_BOUNDS[4]) return 3;
  if (p < CHAPTER_BOUNDS[5]) return 4;
  return 0;
}

export function getChapterProgress(progress: number): number {
  const p = clamp01(progress);
  if (p >= CHAPTER_BOUNDS[5]) return ramp(p, CHAPTER_BOUNDS[5], 1);
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
  tiltY: number;
  tiltX: number;
  glow: number;
  inspect: number;
  closing: boolean;
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
  featherLift: number;
  featherSpread: number;
  bindingLift: number;
  corkGlow: number;
  openAmount: number;
  assembledOpacity: number;
};

/** One intact shuttle: inspect each part, then ease back to the complete bird. */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);

  const feathers = pulse(p, 0.07, 0.16, 0.22, 0.30);
  const geometry = pulse(p, 0.26, 0.34, 0.40, 0.48);
  const binding = pulse(p, 0.44, 0.52, 0.56, 0.64);
  const cork = pulse(p, 0.60, 0.68, 0.72, 0.86);
  const inspect = Math.max(feathers, geometry, binding, cork);
  const closing = p >= 0.76;

  const imgY = feathers * 16 + geometry * 8 + binding * -4 + cork * -18;
  const imgScale = 1 + inspect * 0.06;
  const tiltY = lerp(-0.6, 2.4, inspect);
  const tiltX = -0.5 + Math.sin(p * Math.PI) * 0.9;
  const glow = inspect;

  const highlight: ScrollChapter | null =
    closing || chapter === 0 ? null : CHAPTERS[chapter].id;

  return {
    imgY,
    imgScale,
    tiltY,
    tiltX,
    glow,
    inspect,
    closing,
    highlight,
    chapter,
    local,
    featherLift: feathers * 24,
    featherSpread: feathers * 0.04,
    bindingLift: binding * 16,
    corkGlow: cork,
    openAmount: inspect,
    assembledOpacity: 1,
  };
}
