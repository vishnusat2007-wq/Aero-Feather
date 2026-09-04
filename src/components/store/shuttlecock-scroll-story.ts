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

/** Chapter windows across the full 0→1 scroll track (cork runs through the end). */
const CHAPTER_BOUNDS = [0, 0.08, 0.26, 0.44, 0.62, 1] as const;

/** Intro hold — forward opening has not started. */
export const CLOSED_PROGRESS = CHAPTER_BOUNDS[1];

/**
 * Reverse must land on the assembled start pose by this progress — near the
 * intro, not 30% after the peak. A short close-span left most of the rewind
 * sitting on closedAnim(), so a 0.003 Android jitter flipped direction and
 * exploded chapter 3 under the PNG.
 *
 * Mobile finishes slightly sooner than desktop; the shorter 300svh track is
 * the rest of the phone snap. Opening keyframes are unchanged.
 */
export const REVERSE_CLOSE_END_MOBILE = 0.12;
export const REVERSE_CLOSE_END_DESKTOP = CLOSED_PROGRESS;

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
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
};

export function isFullyClosed(progress: number): boolean {
  return clamp01(progress) < CHAPTER_BOUNDS[1];
}

/**
 * Assembled PNG is fully opaque at openAmount 0.12. Treat that as visually
 * closed so exploded cork/feather/binding slices never sit under the PNG.
 */
export const ASSEMBLED_OPEN_AMOUNT = 0.12;

/**
 * During reverse playback, fade the moving slices away only as they physically
 * meet the assembled image. This removes the last-frame pop without changing
 * any of the forward/opening keyframes.
 */
export const REVERSE_CROSSFADE_START = 0.245;
export const REVERSE_ASSEMBLED_OPEN_AMOUNT = 0.015;

/** True when the pose matches the first-segment assembled shuttle. */
export function isAssembledPose(anim: ScrollViewAnim): boolean {
  return anim.openAmount <= ASSEMBLED_OPEN_AMOUNT;
}

/** Exploded crops only while the peel is actually open. */
export function shouldShowExplodedLayers(anim: ScrollViewAnim): boolean {
  return anim.openAmount > ASSEMBLED_OPEN_AMOUNT;
}

/** True only once the reverse-moving parts are effectively back in place. */
export function isReverseAssembledPose(anim: ScrollViewAnim): boolean {
  return (
    anim.openAmount <= REVERSE_ASSEMBLED_OPEN_AMOUNT &&
    anim.featherLift <= 1.25 &&
    anim.bindingLift <= 1.25 &&
    anim.featherSpread <= 0.005
  );
}

/** Opacity for the moving slices while the reverse close crossfades. */
export function getReverseExplodedOpacity(anim: ScrollViewAnim): number {
  const span = REVERSE_CROSSFADE_START - REVERSE_ASSEMBLED_OPEN_AMOUNT;
  return clamp01((anim.openAmount - REVERSE_ASSEMBLED_OPEN_AMOUNT) / span);
}

/** Assembled start pose — reverse playback must land here, not a mid-explode. */
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

/**
 * 0 at the reverse turnaround, 1 once progress has reached closeEnd.
 * Span is (peak − closeEnd) so close finishes at the start pose, not mid-track.
 */
export function getReverseCloseAmount(
  progress: number,
  peak: number,
  closeEnd: number = REVERSE_CLOSE_END_DESKTOP,
): number {
  const p = clamp01(progress);
  const crest = clamp01(peak);
  const end = clamp01(closeEnd);
  if (p <= end || crest <= end) return 1;
  if (p >= crest) return 0;
  return clamp01((crest - p) / (crest - end));
}

export type ScrubState = {
  progress: number;
  peak: number;
};

/** High-water peak since the last full close. Never lowered on reverse. */
export function advanceScrub(prev: ScrubState, raw: number, snapClosed = 0): ScrubState {
  let progress = clamp01(raw);
  if (progress <= snapClosed) progress = 0;
  if (progress <= 0) return { progress: 0, peak: 0 };
  return { progress, peak: Math.max(prev.peak, progress) };
}

function blendToClosed(from: ScrollViewAnim, amount: number): ScrollViewAnim {
  const t = easeInOutCubic(clamp01(amount));
  if (t >= 1) return closedAnim();
  if (t <= 0) return from;
  const keepHighlight = t < 0.82 && from.highlight && from.highlight !== "intro";
  return {
    focusY: lerp(from.focusY, 0, t),
    focusScale: lerp(from.focusScale, 1, t),
    tiltY: lerp(from.tiltY, -2, t),
    tiltX: lerp(from.tiltX, -1, t),
    featherLift: lerp(from.featherLift, 0, t),
    featherSpread: lerp(from.featherSpread, 0, t),
    bindingLift: lerp(from.bindingLift, 0, t),
    corkGlow: lerp(from.corkGlow, 0, t),
    openAmount: lerp(from.openAmount, 0, t),
    highlight: keepHighlight ? from.highlight : null,
    chapter: t >= 0.82 ? 0 : from.chapter,
    local: lerp(from.local, 0, t),
  };
}

export type ScrollPlayback = {
  peak?: number;
  closeEnd?: number;
};

/** Lift values in px — tuned for ~400px-wide stage */
export function getForwardAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);
  const eased = easeInOutCubic(clamp01(local));

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
      return closedAnim();
    case 1:
      focusY = lerp(0, 56, eased);
      focusScale = lerp(1, 1.02, eased);
      featherLift = lerp(0, 70, eased);
      featherSpread = lerp(0, 0.14, eased);
      openAmount = lerp(0, 0.5, eased);
      tiltY = lerp(-2, 3, eased);
      break;
    case 2:
      focusY = lerp(56, 64, eased);
      focusScale = lerp(1.02, 1.04, eased);
      featherLift = lerp(70, 110, eased);
      featherSpread = lerp(0.14, 0.22, eased);
      bindingLift = lerp(0, 35, eased);
      openAmount = lerp(0.5, 0.7, eased);
      tiltY = 3;
      break;
    case 3:
      focusY = lerp(64, 36, eased);
      focusScale = lerp(1.04, 1, eased);
      featherLift = lerp(110, 95, eased);
      featherSpread = lerp(0.22, 0.18, eased);
      bindingLift = lerp(35, 90, eased);
      openAmount = lerp(0.7, 0.9, eased);
      tiltY = lerp(4, -2, eased);
      break;
    case 4:
      focusY = lerp(8, 20, eased);
      focusScale = lerp(1.05, 1.08, eased);
      featherLift = lerp(95, 40, eased);
      featherSpread = lerp(0.18, 0.06, eased);
      bindingLift = lerp(90, 30, eased);
      corkGlow = lerp(0.3, 1, eased);
      openAmount = lerp(0.9, 0.55, eased);
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

/**
 * Pose is a function of (progress, peak) — not a noisy scroll direction flag.
 * Climbing or at the crest uses the opening story unchanged. Below the peak,
 * blend that crest pose back to assembled. Chapter 4 never reaches closed on
 * its own, but a 0.003 direction flip must not jump to an exploded chapter.
 */
export function getScrollAnim(progress: number, playback: ScrollPlayback = {}): ScrollViewAnim {
  const p = clamp01(progress);
  const peak = clamp01(playback.peak ?? p);
  if (p <= 0 || isFullyClosed(p)) return closedAnim();
  if (p >= peak) return getForwardAnim(p);
  const closeAmount = getReverseCloseAmount(p, peak, playback.closeEnd);
  if (closeAmount >= 1) return closedAnim();
  return blendToClosed(getForwardAnim(peak), closeAmount);
}
