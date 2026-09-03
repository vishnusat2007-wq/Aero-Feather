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
 *  0.07–0.22  feathers
 *  0.22–0.38  geometry
 *  0.38–0.52  binding
 *  0.52–0.66  cork
 *  0.66–1.00  assemble / close — camera returns to identity
 */
const CHAPTER_BOUNDS = [0, 0.07, 0.22, 0.38, 0.52, 0.66, 1] as const;

/** Camera waypoints. Start and end are the same complete shuttle. */
const CAMERA = [
  { p: 0.0, y: 0, s: 1, bloom: 0 },
  { p: 0.07, y: 0, s: 1, bloom: 0 },
  { p: 0.15, y: 6, s: 1.03, bloom: 1 },
  { p: 0.3, y: 4, s: 1.028, bloom: 0.92 },
  { p: 0.45, y: -2, s: 1.022, bloom: 0.78 },
  { p: 0.58, y: -6, s: 1.02, bloom: 0.7 },
  { p: 0.66, y: -3, s: 1.014, bloom: 0.35 },
  { p: 0.78, y: 0, s: 1.02, bloom: 0.08 },
  { p: 0.88, y: 0, s: 1.028, bloom: 0 },
  { p: 0.96, y: 0, s: 1.006, bloom: 0 },
  { p: 1.0, y: 0, s: 1, bloom: 0 },
] as const;

export const HIGHLIGHT_ZONES: Record<
  Exclude<ScrollChapter, "intro" | "assemble">,
  { top: number; left: number; width: number; height: number }
> = {
  feathers: { top: 6, left: 10, width: 80, height: 36 },
  geometry: { top: 28, left: 16, width: 68, height: 22 },
  binding: { top: 48, left: 24, width: 52, height: 14 },
  cork: { top: 74, left: 30, width: 40, height: 24 },
};

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

function sampleCamera(p: number) {
  const x = clamp01(p);
  if (x <= CAMERA[0].p) return CAMERA[0];
  const last = CAMERA[CAMERA.length - 1];
  if (x >= last.p) return last;
  for (let i = 1; i < CAMERA.length; i++) {
    const prev = CAMERA[i - 1];
    const next = CAMERA[i];
    if (x <= next.p) {
      const t = smootherstep((x - prev.p) / (next.p - prev.p));
      return {
        p: x,
        y: lerp(prev.y, next.y, t),
        s: lerp(prev.s, next.s, t),
        bloom: lerp(prev.bloom, next.bloom, t),
      };
    }
  }
  return last;
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
  corkGlow: number;
  openAmount: number;
  assembledOpacity: number;
};

/** One intact shuttle. Inspect is a padded Ken Burns; close eases back to identity. */
export function getScrollAnim(progress: number): ScrollViewAnim {
  const p = clamp01(progress);
  const chapter = getChapterIndex(p);
  const local = getChapterProgress(p);
  const cam = sampleCamera(p);

  const inspect = pulse(p, 0.07, 0.16, 0.58, 0.78);
  const closing = p >= CHAPTER_BOUNDS[5];
  const settle = pulse(p, 0.78, 0.86, 0.9, 0.98);
  const assemblingLabel = pulse(p, 0.66, 0.72, 0.88, 0.96);

  const tiltY = lerp(-0.4, 2.1, cam.bloom);
  const tiltX = -0.35 + Math.sin(p * Math.PI) * 0.7;
  const glow = Math.max(cam.bloom, settle * 0.85);

  const part =
    chapter === 0 || chapter === 5 ? null : (CHAPTERS[chapter].id as Exclude<ScrollChapter, "intro" | "assemble">);

  return {
    imgY: cam.y,
    imgScale: cam.s,
    bloom: cam.bloom,
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
    featherLift: 0,
    featherSpread: cam.bloom * 0.03,
    bindingLift: 0,
    corkGlow: pulse(p, 0.5, 0.56, 0.62, 0.74),
    openAmount: cam.bloom,
    assembledOpacity: 1,
  };
}

export function getCloseIntegrity(progress: number) {
  const anim = getScrollAnim(progress);
  return {
    intact: anim.assembledOpacity === 1 && anim.featherLift === 0 && anim.bindingLift === 0,
    atRest: Math.abs(anim.imgY) < 0.05 && Math.abs(anim.imgScale - 1) < 0.008,
    closing: anim.closing,
  };
}
