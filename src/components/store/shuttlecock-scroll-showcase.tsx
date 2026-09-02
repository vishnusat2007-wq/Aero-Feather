"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CHAPTERS,
  getChapterIndex,
  getChapterProgress,
  getHeroStage,
  getScrollAnim,
  HIGHLIGHT_ZONES,
  PART_CALLOUTS,
  type HeroStage,
} from "@/components/store/shuttlecock-scroll-story";

export type { HeroStage };

const SHUTTLE_SRC = "/shuttlecock-hero-transparent.png";
const IMG_W = 975;
const IMG_H = 1364;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Props = {
  onStageChange?: (stage: HeroStage) => void;
  onChapterChange?: (index: number) => void;
};

/** Full-size shuttle image aligned inside the stage box */
function ShuttleImage({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Image
      src={SHUTTLE_SRC}
      alt=""
      width={IMG_W}
      height={IMG_H}
      priority
      draggable={false}
      className={cn("pointer-events-none absolute left-0 w-full select-none object-contain object-top", className)}
      style={{ height: "100%", ...style }}
    />
  );
}

export function ShuttlecockScrollShowcase({ onStageChange, onChapterChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  const updateProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)));
  }, []);

  useEffect(() => {
    updateProgress();
    const onScroll = () => requestAnimationFrame(updateProgress);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const effectiveProgress = reducedMotion ? 0.42 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapterLocal = getChapterProgress(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const highlight = anim.highlight;

  const activeCallout =
    highlight && highlight !== "intro"
      ? PART_CALLOUTS.find((c) => c.id === highlight)
      : null;

  const calloutChapter =
    highlight && highlight !== "intro" ? CHAPTERS.find((c) => c.id === highlight) : null;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const featherScale = 1 + anim.featherSpread;
  const gapVisible = anim.openAmount > 0.08;

  return (
    <div ref={trackRef} className="relative h-[500vh]">
      {/* overflow-visible so lifted parts are not clipped */}
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-visible">
        <div
          className="relative mx-auto flex h-full w-full max-w-[640px] items-center justify-center px-2"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300",
              progress > 0.05 ? "opacity-0 pointer-events-none" : "opacity-90",
            )}
          >
            <span className="text-[10px] font-semibold tracking-[0.18em] text-af-cyan uppercase">
              Scroll to open each part
            </span>
            <span className="h-8 w-px animate-af-float bg-af-cyan/60" />
          </div>

          {/* Chapter progress bar */}
          <div className="absolute top-6 left-1/2 z-50 flex -translate-x-1/2 gap-1.5">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === chapterIdx ? "w-8 bg-af-cyan" : "w-3 bg-af-cyan/20",
                )}
              />
            ))}
          </div>

          <div
            className="relative z-10 w-full max-w-[400px]"
            style={{
              transform: `
                translateY(${anim.focusY}px)
                scale(${anim.focusScale})
                rotateY(${anim.tiltY}deg)
                rotateX(${anim.tiltX}deg)
              `,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Stage — fixed aspect ratio matching shuttle photo */}
            <div
              className="relative mx-auto w-full overflow-visible"
              style={{ aspectRatio: `${IMG_W} / ${IMG_H}`, maxHeight: "min(72vh, 620px)" }}
            >
              {/* Gap labels between layers when open */}
              {gapVisible && anim.featherLift > 8 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(44% - ${anim.featherLift}px - 14px)`,
                    opacity: Math.min(1, anim.openAmount * 1.5),
                  }}
                >
                  Feathers
                </div>
              )}
              {gapVisible && anim.bindingLift > 8 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(48% - ${anim.bindingLift}px - 14px)`,
                    opacity: Math.min(1, anim.openAmount * 1.5),
                  }}
                >
                  Binding
                </div>
              )}

              {/* Connector stems in the gaps */}
              {gapVisible && (
                <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible" aria-hidden>
                  {anim.featherLift > 10 && (
                    <line
                      x1="50%"
                      y1={`${44 - anim.featherLift * 0.08}%`}
                      x2="50%"
                      y2="44%"
                      stroke="#20B6E8"
                      strokeWidth="2"
                      strokeDasharray="4 5"
                      opacity={0.55}
                    />
                  )}
                  {anim.bindingLift > 10 && (
                    <line
                      x1="50%"
                      y1={`${52 - anim.bindingLift * 0.08}%`}
                      x2="50%"
                      y2="52%"
                      stroke="#20B6E8"
                      strokeWidth="2"
                      strokeDasharray="4 5"
                      opacity={0.55}
                    />
                  )}
                </svg>
              )}

              {/* ── CORK (bottom) — stays fixed ── */}
              <div className="absolute inset-x-0 bottom-0 z-10 h-[52%] overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-[192%]">
                  <ShuttleImage
                    className="bottom-0 top-auto"
                    style={{
                      filter:
                        highlight === "cork"
                          ? `brightness(1.1) drop-shadow(0 0 ${20 + anim.corkGlow * 30}px rgba(32,182,232,0.5))`
                          : undefined,
                    }}
                  />
                </div>
                {highlight === "cork" && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-af-cyan/10"
                    style={{ opacity: anim.corkGlow * 0.7 }}
                  />
                )}
              </div>

              {/* ── BINDING (middle band) — lifts up ── */}
              <div
                className="absolute inset-x-[14%] z-20 overflow-visible"
                style={{
                  top: "41%",
                  height: "9%",
                  transform: `translateY(-${anim.bindingLift}px) translateZ(${anim.bindingLift}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative h-full overflow-hidden rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
                  <div className="absolute inset-x-[-20%] top-[-455%] h-[1920%]">
                    <ShuttleImage
                      style={{
                        filter:
                          highlight === "binding"
                            ? "brightness(1.12) drop-shadow(0 0 16px rgba(32,182,232,0.45))"
                            : "brightness(1.05)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── FEATHERS (top cone) — lifts + blooms ── */}
              <div
                className="absolute inset-x-0 top-0 z-30 overflow-visible"
                style={{
                  height: "44%",
                  transform: `
                    translateY(-${anim.featherLift}px)
                    translateZ(${anim.featherLift * 1.2}px)
                    scale(${featherScale})
                  `,
                  transformOrigin: "50% 100%",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative h-full overflow-hidden drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                  <div className="absolute inset-x-0 top-0 h-[227%]">
                    <ShuttleImage
                      style={{
                        filter:
                          highlight === "feathers" || highlight === "geometry"
                            ? "brightness(1.1) drop-shadow(0 0 14px rgba(32,182,232,0.35))"
                            : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Assembled view — only when fully closed */}
              <div
                className="pointer-events-none absolute inset-0 z-40"
                style={{
                  opacity: Math.max(0, 1 - anim.openAmount * 10),
                }}
              >
                <Image
                  src={SHUTTLE_SRC}
                  alt="Premium goose-feather badminton shuttlecock"
                  width={IMG_W}
                  height={IMG_H}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Highlight ring */}
              {highlight && highlight !== "intro" && (
                <div
                  className="pointer-events-none absolute z-50 rounded-full border-2 border-af-cyan shadow-[0_0_32px_rgba(32,182,232,0.55)]"
                  style={{
                    top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                    left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                    width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                    height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                    opacity: 0.6 + chapterLocal * 0.4,
                    transform: `translateY(-${
                      highlight === "feathers" || highlight === "geometry"
                        ? anim.featherLift
                        : highlight === "binding"
                          ? anim.bindingLift
                          : 0
                    }px)`,
                  }}
                />
              )}

              {/* Geometry arcs */}
              {highlight === "geometry" && (
                <svg
                  className="pointer-events-none absolute inset-0 z-[45] h-full w-full overflow-visible"
                  style={{
                    transform: `translateY(-${anim.featherLift}px) scale(${featherScale})`,
                    transformOrigin: "50% 100%",
                  }}
                  aria-hidden
                >
                  {[28, 36, 44].map((y, i) => (
                    <ellipse
                      key={y}
                      cx="50%"
                      cy={`${y}%`}
                      rx={`${26 + i * 4}%`}
                      ry="3.5%"
                      fill="none"
                      stroke="#20B6E8"
                      strokeWidth="2"
                      opacity={0.65 - i * 0.12}
                      strokeDasharray="6 4"
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* Callout card */}
          {activeCallout && calloutChapter && chapterIdx > 0 && (
            <div className="pointer-events-none absolute inset-0 z-50 hidden sm:block">
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <line
                  x1={`${activeCallout.anchorPct.x}%`}
                  y1={`${activeCallout.anchorPct.y}%`}
                  x2={`${activeCallout.labelPct.x}%`}
                  y2={`${activeCallout.labelPct.y}%`}
                  stroke="#20B6E8"
                  strokeWidth="2"
                  opacity={0.85}
                />
                <circle
                  cx={`${activeCallout.anchorPct.x}%`}
                  cy={`${activeCallout.anchorPct.y}%`}
                  r="6"
                  fill="#20B6E8"
                />
              </svg>
              <div
                className="absolute max-w-[200px] rounded-lg border border-af-cyan/50 bg-af-surface px-4 py-3 shadow-[0_0_40px_rgba(32,182,232,0.25)]"
                style={{
                  left: `${activeCallout.labelPct.x}%`,
                  top: `${activeCallout.labelPct.y}%`,
                  transform:
                    activeCallout.align === "right" ? "translate(-100%, -50%)" : "translate(8px, -50%)",
                }}
              >
                <p className="text-[11px] font-bold text-af-cyan">
                  {calloutChapter.num} — {calloutChapter.title}
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-af-muted">{calloutChapter.desc}</p>
              </div>
            </div>
          )}

          {/* Mobile card */}
          {chapterIdx > 0 && (
            <div className="absolute bottom-6 left-1/2 z-50 w-[min(92%,360px)] -translate-x-1/2 rounded-lg border border-af-cyan/40 bg-af-surface/95 px-4 py-3 shadow-xl backdrop-blur-md sm:hidden">
              <p className="text-xs font-bold text-af-cyan">
                {chapter.num} — {chapter.title}
              </p>
              <p className="mt-1 text-[11px] text-af-muted">{chapter.desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
