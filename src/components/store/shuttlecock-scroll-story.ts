export type ScrollChapter = "intro" | "feathers" | "geometry" | "binding" | "cork";

export type HeroStage = { num: string; label: string };

export type ChapterInfo = {
  id: ScrollChapter;
  num: string;
  label: string;
  title: string;
  desc: string;
};

export const CHAPTERS: ChapterInfo[] = [
  {
    id: "intro",
    num: "01",
    label: "FLIGHT",
    title: "TOURNAMENT SHUTTLECOCK",
    desc: "A complete premium goose-feather shuttlecock — engineered for stable flight from cork to tip.",
  },
  {
    id: "feathers",
    num: "02",
    label: "FEATHER",
    title: "SELECTED GOOSE FEATHERS",
    desc: "Sixteen overlapping natural feathers flare outward for aerodynamic stability and consistent rotation.",
  },
  {
    id: "geometry",
    num: "03",
    label: "GEOMETRY",
    title: "PRECISE FEATHER GEOMETRY",
    desc: "Uniform spacing and skirt angle maintain predictable flight path through every rally.",
  },
  {
    id: "binding",
    num: "04",
    label: "DURABILITY",
    title: "REINFORCED BINDING",
    desc: "Double thread rows lock the feather stems — built to survive demanding club and tournament play.",
  },
  {
    id: "cork",
    num: "05",
    label: "CONTROL",
    title: "PRECISION CORK BASE",
    desc: "Natural cork base delivers balanced impact response and dependable shuttle behaviour on every hit.",
  },
];

const CHAPTER_BOUNDS = [0, 0.12, 0.3, 0.48, 0.66, 0.84, 1] as const;

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

/** Map scroll progress 0→1 to active chapter index */
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

/** Highlight ring positions (% of shuttle image box) */
export const HIGHLIGHT_ZONES: Record<
  Exclude<ScrollChapter, "intro">,
  { top: number; left: number; width: number; height: number }
> = {
  feathers: { top: 8, left: 18, width: 64, height: 38 },
  geometry: { top: 28, left: 22, width: 56, height: 22 },
  binding: { top: 48, left: 26, width: 48, height: 10 },
  cork: { top: 58, left: 30, width: 40, height: 28 },
};

export type ScrollViewAnim = {
  /** Camera-style vertical focus (-1 feathers, +1 cork) */
  focusY: number;
  /** Subtle zoom toward active part */
  focusScale: number;
  /** Max ~10° — product reveal, not spinning */
  tiltY: number;
  tiltX: number;
  /** Feather skirt bloom from cork anchor */
  featherBloom: number;
  /** Layer peel depth in px (CSS translateZ) */
  featherPeel: number;
  bindingPeel: number;
  corkGlow: number;
  highlight: ScrollChapter | null;
  chapter: number;
  local: number;
};

/** Scroll-scrubbed view + part reveal — car-site style, not flat spin */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);
  const eased = easeInOutCubic(local);

  const highlight: ScrollChapter | null = chapter === 0 ? null : CHAPTERS[chapter].id;

  // Camera dolly: focus shifts down the shuttle as chapters advance
  let focusY = 0;
  let focusScale = 1;
  let tiltY = lerp(-4, 6, p);
  let tiltX = -2 + Math.sin(p * Math.PI) * 1.5;

  let featherBloom = 0;
  let featherPeel = 0;
  let bindingPeel = 0;
  let corkGlow = 0;

  switch (chapter) {
    case 0:
      focusY = lerp(0, -8, eased);
      focusScale = lerp(1, 1.04, eased);
      break;
    case 1:
      focusY = lerp(-8, -22, eased);
      focusScale = lerp(1.04, 1.12, eased);
      featherBloom = lerp(0, 0.08, eased);
      featherPeel = lerp(0, 18, eased);
      tiltY = lerp(6, 2, eased);
      break;
    case 2:
      focusY = lerp(-22, -18, eased);
      focusScale = lerp(1.12, 1.14, eased);
      featherBloom = lerp(0.08, 0.12, eased);
      featherPeel = lerp(18, 28, eased);
      bindingPeel = lerp(0, 8, eased);
      tiltY = 2;
      break;
    case 3:
      focusY = lerp(-18, 6, eased);
      focusScale = lerp(1.14, 1.1, eased);
      featherBloom = lerp(0.12, 0.06, eased);
      featherPeel = lerp(28, 14, eased);
      bindingPeel = lerp(8, 22, eased);
      tiltY = lerp(2, -3, eased);
      break;
    case 4:
      focusY = lerp(6, 28, eased);
      focusScale = lerp(1.1, 1.16, eased);
      featherBloom = lerp(0.06, 0, eased);
      featherPeel = lerp(14, 0, eased);
      bindingPeel = lerp(22, 6, eased);
      corkGlow = lerp(0.3, 1, eased);
      tiltY = lerp(-3, -6, eased);
      tiltX = lerp(-2, 1, eased);
      break;
  }

  return {
    focusY,
    focusScale,
    tiltY,
    tiltX,
    featherBloom,
    featherPeel,
    bindingPeel,
    corkGlow,
    highlight,
    chapter,
    local: easeOutCubic(local),
  };
}
