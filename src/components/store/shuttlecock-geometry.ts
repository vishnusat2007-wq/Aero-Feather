/** Shuttlecock geometry — based on tournament goose-feather reference */

export const FEATHER_COUNT = 16;
export const CX = 200;
export const CY = 240;

/** Cork hemisphere centre (bottom of shuttle) */
export const CORK = { x: 200, y: 332, rx: 38, ry: 22 };

/** Where feather stems meet the cork */
export const SKIRT_BASE_Y = 298;
export const SKIRT_BASE_RX = 46;

/** Feather tips converge near apex */
export const APEX_Y = 88;

export type FeatherSpec = {
  index: number;
  angle: number;
  depth: number; // 0 = front, 1 = back (for layering)
};

export function getFeathers(): FeatherSpec[] {
  return Array.from({ length: FEATHER_COUNT }, (_, i) => ({
    index: i,
    angle: (i / FEATHER_COUNT) * Math.PI * 2 - Math.PI / 2,
    depth: Math.abs(Math.sin((i / FEATHER_COUNT) * Math.PI * 2)),
  }));
}

/** Base point on cork ring for feather i */
export function stemBase(i: number) {
  const a = (i / FEATHER_COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CX + Math.cos(a) * SKIRT_BASE_RX,
    y: SKIRT_BASE_Y + Math.sin(a) * 8,
    angle: a,
  };
}

/** Exploded offset for component separation */
export function explodeOffset(
  explode: number,
  kind: "feather" | "binding" | "thread" | "cork",
  index = 0,
) {
  const e = explode;
  if (kind === "cork") return { x: 0, y: e * 48, rot: 0 };
  if (kind === "binding") return { x: 0, y: e * 18, rot: 0 };
  if (kind === "thread") return { x: 0, y: e * 10, rot: 0 };
  // feather — spread radially + slight upward fan
  const a = (index / FEATHER_COUNT) * Math.PI * 2 - Math.PI / 2;
  const spread = e * 22;
  return {
    x: Math.cos(a) * spread,
    y: Math.sin(a) * spread * 0.35 - e * 12,
    rot: e * 14 * Math.cos(a),
  };
}

/**
 * Single goose feather vane — paddle shape with rounded tip (reference photo).
 * Drawn in local coords: base at (0,0), tip at (0, -len).
 */
export function featherVanePath(len: number, width: number) {
  const w = width;
  const l = len;
  return [
    `M 0 0`,
    `C ${w * 0.55} ${-l * 0.15} ${w * 0.95} ${-l * 0.55} ${w * 0.72} ${-l * 0.82}`,
    `Q ${w * 0.35} ${-l * 0.98} 0 ${-l}`,
    `Q ${-w * 0.35} ${-l * 0.98} ${-w * 0.72} ${-l * 0.82}`,
    `C ${-w * 0.95} ${-l * 0.55} ${-w * 0.55} ${-l * 0.15} 0 0`,
    `Z`,
  ].join(" ");
}

/** Thread ring Y positions (two rows like real shuttlecock) */
export const THREAD_RINGS = [
  { y: 248, rx: 52, ry: 14 },
  { y: 218, rx: 44, ry: 12 },
];
