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
 * Chapter windows across the full 0→1 scroll track. Five parts, evenly spaced
 * after a short intro hold. The final part (cork) window runs to the end, where
 * a short re-close tail reassembles the shuttle so the section exits cleanly.
 */
export const CHAPTER_BOUNDS = [0, 0.08, 0.28, 0.48, 0.7, 1] as const;

/** Intro hold — the shuttle is assembled and no part has lifted yet. */
export const CLOSED_PROGRESS = CHAPTER_BOUNDS[1];

/**
 * The assembled PNG is fully opaque at/under this openAmount. Treat that as
 * visually closed so exploded cork/feather/binding crops never sit under it.
 */
export const ASSEMBLED_OPEN_AMOUNT = 0.12;

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

/** Eased 0→1 ramp across a progress window, clamped outside it. */
function ramp(p: number, start: number, end: number) {
  if (end <= start) return p >= end ? 1 : 0;
  return easeInOutCubic(clamp01((p - start) / (end - start)));
}

export function getChapterIndex(progress: number): number {
  const p = clamp01(progress);
  if (p < CHAPTER_BOUNDS[1]) return 0;
  if (p < CHAPTER_BOUNDS[2]) return 1;
  if (p < CHAPTER_BOUNDS[3]) return 2;
  if (p < CHAPTER_BOUNDS[4]) return 3;
  return 4;
}

export function getChapterProgress(progress: number): number {
  const idx = getChapterIndex(progress);
  const start = CHAPTER_BOUNDS[idx];
  const end = CHAPTER_BOUNDS[idx + 1] ?? 1;
  if (end === start) return 1;
  return clamp01((progress - start) / (end - start));
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

/** Assembled start/end pose — zero lifts, whole shuttle on screen. */
function closedAnim(): ScrollViewAnim {
  return {
    focusY: 0,
    focusScale: 1,
    tiltY: -2,
    tiltX: -1,
    featherLift: 0,
    featherSpread: 0,
    bindingLift: 0,
    corkGlow: 0,
    openAmount: 0,
    highlight: null,
    chapter: 0,
    local: 0,
  };
}

export function isFullyClosed(progress: number): boolean {
  return clamp01(progress) < CHAPTER_BOUNDS[1];
}

/** True when the pose matches the assembled shuttle (both track ends). */
export function isAssembledPose(anim: ScrollViewAnim): boolean {
  return anim.openAmount <= ASSEMBLED_OPEN_AMOUNT;
}

/** Exploded cork/feather/binding crops + highlight rings are only shown once open. */
export function shouldShowExplodedLayers(anim: ScrollViewAnim): boolean {
  return anim.openAmount > ASSEMBLED_OPEN_AMOUNT;
}

/** Crossfade the assembled PNG out as the parts separate. */
export function getAssembledOpacity(anim: ScrollViewAnim): number {
  if (!shouldShowExplodedLayers(anim)) return 1;
  return Math.max(0, 1 - (anim.openAmount - ASSEMBLED_OPEN_AMOUNT) * 8);
}

/**
 * The shuttle pose is a pure function of scroll progress — nothing else.
 *
 * Because forward and reverse read the exact same curve, scrolling back up is
 * simply the animation played in reverse in lockstep with the scrollbar. There
 * is no direction flag, peak tracking or close-lock to "fight" the user: the
 * shuttle is always exactly where the scroll position says it should be.
 *
 * Choreography across 0→1:
 *   0.00–0.08  assembled hold (chapter 01 · FLIGHT)
 *   0.08–0.28  feathers lift + bloom (02 · FEATHER)
 *   0.28–0.48  feather geometry arcs (03 · GEOMETRY)
 *   0.48–0.70  binding lifts (04 · DURABILITY)
 *   0.70–1.00  cork keeps separating + glows (05 · CONTROL)
 *
 * Every part keeps moving right up to the end — the cork separates all the way
 * to progress 1 — so no scroll range is ever frozen (nothing feels "stuck").
 * There is no re-close tail: the reveal ends fully separated so scrolling back
 * up simply reassembles the shuttle 05→01 in one smooth, monotonic motion.
 */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  if (p <= 0 || isFullyClosed(p)) return closedAnim();

  const local = getChapterProgress(p);
  const chapter = getChapterIndex(p);

  const feather = ramp(p, 0.08, 0.32);
  const binding = ramp(p, 0.48, 0.72);
  const cork = ramp(p, 0.68, 1);

  const featherLift = feather * 104;
  const featherSpread = feather * 0.2;
  const bindingLift = binding * 86;
  const corkGlow = cork;
  const openAmount = Math.max(feather, binding * 0.9, cork * 0.75);

  const spread = ramp(p, 0.08, 0.95);
  const focusScale = 1 + 0.07 * spread;
  const focusY = lerp(0, 30, spread);
  const tiltY = lerp(-2, 3, spread);
  const tiltX = -1 + Math.sin(p * Math.PI) * 1.5;

  const highlight: ScrollChapter | null =
    chapter === 0 ? null : CHAPTERS[chapter].id;

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

export type HeroTrackSample = {
  trackTop: number;
  trackHeight: number;
  /** Must be the sticky pane height — not window.innerHeight (URL-bar jitter). */
  viewportHeight: number;
};

/** Raw 0→1 progress from the track's layout box. */
export function readHeroTrack(sample: HeroTrackSample): number {
  const scrollable = Math.max(1, sample.trackHeight - sample.viewportHeight);
  return clamp01(-sample.trackTop / scrollable);
}
