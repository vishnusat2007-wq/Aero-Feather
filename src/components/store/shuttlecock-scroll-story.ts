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

const CHAPTER_BOUNDS = [0, 0.08, 0.26, 0.44, 0.62, 0.8, 1] as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getChapterIndex(progress: number): number {
  const p = clamp01(progress);
  if (p < CHAPTER_BOUNDS[1]) return 0;
  if (p < CHAPTER_BOUNDS[2]) return 1;
  if (p < CHAPTER_BOUNDS[3]) return 2;
  if (p < CHAPTER_BOUNDS[4]) return 3;
  if (p < CHAPTER_BOUNDS[5]) return 4;
  return 4;
}

export function getChapterProgress(progress: number): number {
  const idx = getChapterIndex(progress);
  const start = CHAPTER_BOUNDS[idx];
  const end = CHAPTER_BOUNDS[idx + 1];
  return end === start ? 1 : (progress - start) / (end - start);
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
  { id: "feathers", anchorPct: { x: 50, y: 18 }, labelPct: { x: 4, y: 8 }, align: "left" },
  { id: "geometry", anchorPct: { x: 50, y: 34 }, labelPct: { x: 96, y: 8 }, align: "right" },
  { id: "binding", anchorPct: { x: 50, y: 48 }, labelPct: { x: 4, y: 44 }, align: "left" },
  { id: "cork", anchorPct: { x: 50, y: 74 }, labelPct: { x: 96, y: 70 }, align: "right" },
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
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
};

/** Lift values in px — tuned for ~400px-wide stage */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);
  const eased = easeInOutCubic(local);

  const highlight: ScrollChapter | null = chapter === 0 ? null : CHAPTERS[chapter].id;

  let focusY = 0;
  let focusScale = 1;
  let tiltY = lerp(-2, 3, p);
  const tiltX = -1 + Math.sin(p * Math.PI) * 1.5;

  let featherLift = 0;
  let featherSpread = 0;
  let bindingLift = 0;
  let corkGlow = 0;
  let openAmount = 0;

  switch (chapter) {
    case 0:
      openAmount = eased * 0.05;
      break;
    case 1:
      focusY = lerp(0, -20, eased);
      focusScale = lerp(1, 1.06, eased);
      featherLift = lerp(0, 70, eased);
      featherSpread = lerp(0, 0.14, eased);
      openAmount = lerp(0.05, 0.5, eased);
      tiltY = lerp(-2, 4, eased);
      break;
    case 2:
      focusY = lerp(-20, -24, eased);
      focusScale = lerp(1.06, 1.1, eased);
      featherLift = lerp(70, 110, eased);
      featherSpread = lerp(0.14, 0.22, eased);
      bindingLift = lerp(0, 35, eased);
      openAmount = lerp(0.5, 0.7, eased);
      tiltY = 4;
      break;
    case 3:
      focusY = lerp(-24, 8, eased);
      focusScale = lerp(1.1, 1.05, eased);
      featherLift = lerp(110, 95, eased);
      featherSpread = lerp(0.22, 0.18, eased);
      bindingLift = lerp(35, 90, eased);
      openAmount = lerp(0.7, 0.9, eased);
      tiltY = lerp(4, -2, eased);
      break;
    case 4:
      focusY = lerp(8, 20, eased);
      focusScale = lerp(1.05, 1.08, eased);
      featherLift = lerp(70, 35, eased);
      featherSpread = lerp(0.16, 0.06, eased);
      bindingLift = lerp(70, 30, eased);
      corkGlow = lerp(0.3, 1, eased);
      openAmount = lerp(0.85, 0.5, eased);
      tiltY = lerp(-2, -4, eased);
      break;
  }

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
    highlight,
    chapter,
    local: easeOutCubic(local),
  };
}
