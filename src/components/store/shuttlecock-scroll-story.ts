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

/** Equal scroll room per chapter */
const CHAPTER_BOUNDS = [0, 0.1, 0.28, 0.46, 0.64, 0.82, 1] as const;

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

/** CSS clip-path regions for each physical layer (% tuned to hero photo) */
export const LAYER_CLIPS = {
  feathers: "inset(0% 0% 44% 0%)",
  binding: "inset(40% 16% 48% 16%)",
  cork: "inset(46% 0% 0% 0%)",
} as const;

export const HIGHLIGHT_ZONES: Record<
  Exclude<ScrollChapter, "intro">,
  { top: number; left: number; width: number; height: number }
> = {
  feathers: { top: 6, left: 16, width: 68, height: 40 },
  geometry: { top: 26, left: 20, width: 60, height: 24 },
  binding: { top: 46, left: 24, width: 52, height: 12 },
  cork: { top: 56, left: 28, width: 44, height: 32 },
};

export type PartCallout = {
  id: Exclude<ScrollChapter, "intro">;
  anchorPct: { x: number; y: number };
  labelPct: { x: number; y: number };
  align: "left" | "right";
};

export const PART_CALLOUTS: PartCallout[] = [
  {
    id: "feathers",
    anchorPct: { x: 50, y: 22 },
    labelPct: { x: 6, y: 12 },
    align: "left",
  },
  {
    id: "geometry",
    anchorPct: { x: 50, y: 38 },
    labelPct: { x: 94, y: 10 },
    align: "right",
  },
  {
    id: "binding",
    anchorPct: { x: 50, y: 50 },
    labelPct: { x: 6, y: 48 },
    align: "left",
  },
  {
    id: "cork",
    anchorPct: { x: 50, y: 72 },
    labelPct: { x: 94, y: 68 },
    align: "right",
  },
];

export type ScrollViewAnim = {
  focusY: number;
  focusScale: number;
  tiltY: number;
  tiltX: number;
  /** px — feather cone lifts up */
  featherLift: number;
  /** scale — skirt blooms outward */
  featherSpread: number;
  /** px — binding band lifts */
  bindingLift: number;
  /** 0–1 glow on cork */
  corkGlow: number;
  /** 0–1 overall exploded state */
  openAmount: number;
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
};

export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);
  const eased = easeInOutCubic(local);

  const highlight: ScrollChapter | null = chapter === 0 ? null : CHAPTERS[chapter].id;

  let focusY = 0;
  let focusScale = 1;
  let tiltY = lerp(-3, 4, p);
  const tiltX = -1.5 + Math.sin(p * Math.PI) * 1.2;

  let featherLift = 0;
  let featherSpread = 0;
  let bindingLift = 0;
  let corkGlow = 0;
  let openAmount = 0;

  switch (chapter) {
    case 0:
      focusY = lerp(0, -4, eased);
      focusScale = lerp(1, 1.02, eased);
      openAmount = lerp(0, 0.15, eased);
      break;
    case 1:
      focusY = lerp(-4, -28, eased);
      focusScale = lerp(1.02, 1.1, eased);
      featherLift = lerp(0, 72, eased);
      featherSpread = lerp(0, 0.14, eased);
      openAmount = lerp(0.15, 0.55, eased);
      tiltY = lerp(-3, 5, eased);
      break;
    case 2:
      focusY = lerp(-28, -32, eased);
      focusScale = lerp(1.1, 1.14, eased);
      featherLift = lerp(72, 96, eased);
      featherSpread = lerp(0.14, 0.18, eased);
      bindingLift = lerp(0, 18, eased);
      openAmount = lerp(0.55, 0.75, eased);
      tiltY = 5;
      break;
    case 3:
      focusY = lerp(-32, 4, eased);
      focusScale = lerp(1.14, 1.08, eased);
      featherLift = lerp(96, 88, eased);
      featherSpread = lerp(0.18, 0.16, eased);
      bindingLift = lerp(18, 64, eased);
      openAmount = lerp(0.75, 0.9, eased);
      tiltY = lerp(5, -2, eased);
      break;
    case 4:
      focusY = lerp(4, 24, eased);
      focusScale = lerp(1.08, 1.12, eased);
      featherLift = lerp(88, 48, eased);
      featherSpread = lerp(0.16, 0.08, eased);
      bindingLift = lerp(64, 28, eased);
      corkGlow = lerp(0.2, 1, eased);
      openAmount = lerp(0.9, 0.45, eased);
      tiltY = lerp(-2, -5, eased);
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
