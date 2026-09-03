"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CHAPTERS,
  CLOSED_PROGRESS,
  getChapterIndex,
  getChapterProgress,
  getHeroStage,
  getScrollAnim,
  HIGHLIGHT_ZONES,
  isFullyClosed,
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
    const viewH =
      window.visualViewport && window.visualViewport.height > 0
        ? window.visualViewport.height
        : window.innerHeight;
    const rect = el.getBoundingClientRect();
    const passed = -rect.top + (window.visualViewport?.offsetTop ?? 0);
    const scrollable = Math.max(1, el.offsetHeight - viewH);
    const raw = passed / scrollable;
    // Snap the ends so reverse/forward always complete (Android often stalls near 0).
    if (raw <= CLOSED_PROGRESS) {
      setProgress(0);
      return;
    }
    if (raw >= 1 - CLOSED_PROGRESS) {
      setProgress(1);
      return;
    }
    setProgress(Math.max(0, Math.min(1, raw)));
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      document.documentElement.classList.add("af-hero-scrolling");
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateProgress();
      });
    };
    const onSettle = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      updateProgress();
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("touchend", onSettle, { passive: true });
    window.addEventListener("scrollend", onSettle);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateProgress);
    vv?.addEventListener("scroll", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.classList.remove("af-hero-scrolling");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("touchend", onSettle);
      window.removeEventListener("scrollend", onSettle);
      vv?.removeEventListener("resize", updateProgress);
      vv?.removeEventListener("scroll", onScroll);
    };
  }, [updateProgress]);

  const effectiveProgress = reducedMotion ? 0.42 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapterLocal = getChapterProgress(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const highlight = anim.highlight;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const featherScale = 1 + anim.featherSpread;
  const closed = isFullyClosed(effectiveProgress);
  const gapVisible = !closed && anim.openAmount > 0.08;

  return (
    <div ref={trackRef} className="relative h-[360svh] lg:h-[440vh]">
      <div className="sticky top-0 grid h-[100svh] grid-rows-[1fr_auto] overflow-hidden pt-16 lg:overflow-visible lg:pt-4">
        {/* Shuttle stage — centred, kept clear of text zones */}
        <div
          className="relative flex min-h-0 items-center justify-center px-2 pb-2"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute left-1/2 top-1 z-40 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300 sm:top-2 lg:top-0",
              progress > 0.05 ? "opacity-0 pointer-events-none" : "opacity-90",
            )}
          >
            <span className="rounded-md border border-af-cyan/25 bg-af-bg/80 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-af-cyan uppercase backdrop-blur-sm">
              Scroll to open each part
            </span>
            <span className="h-5 w-px animate-af-float bg-af-cyan/60" />
          </div>

          <div
            className="relative z-10 w-full max-w-[380px] lg:max-w-[400px]"
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
            <div
              className="relative mx-auto w-full overflow-visible"
              style={{
                aspectRatio: `${IMG_W} / ${IMG_H}`,
                maxHeight:
                  highlight === "feathers" || highlight === "geometry"
                    ? "min(58vh, 520px)"
                    : "min(64vh, 580px)",
              }}
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

              {/* ── BINDING (middle band) — lifts up, no boxed “bar” ── */}
              <div
                className="absolute inset-x-[8%] z-20 overflow-hidden"
                style={{
                  top: "40%",
                  height: "12%",
                  transform: `translateY(-${anim.bindingLift}px) translateZ(${anim.bindingLift}px)`,
                  transformStyle: "preserve-3d",
                  opacity: closed || anim.openAmount <= 0.12 ? 0 : 1,
                }}
              >
                <div className="absolute inset-x-[-10%] top-[-340%] h-[1600%]">
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

              {/* ── FEATHERS (top cone) — lifts + blooms ── */}
              <div
                className="absolute inset-x-0 top-0 z-30 overflow-visible"
                style={{
                  height: "44%",
                  opacity: closed || anim.openAmount <= 0.12 ? 0 : 1,
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

              {/* Assembled shuttle stays solid until the peel really starts */}
              <div
                className="pointer-events-none absolute inset-0 z-40"
                style={{
                  opacity: closed
                    ? 1
                    : anim.openAmount < 0.12
                      ? 1
                      : Math.max(0, 1 - (anim.openAmount - 0.12) * 8),
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

              {/* Soft focus glow — never a boxed bar across the feathers */}
              {highlight && highlight !== "intro" && !closed && anim.openAmount > 0.12 && (
                <div
                  className="pointer-events-none absolute z-50 rounded-[40%] border border-af-cyan/50"
                  style={{
                    top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                    left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                    width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                    height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                    opacity: 0.35 + chapterLocal * 0.25,
                    boxShadow: "0 0 24px rgba(32,182,232,0.25)",
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
        </div>

        {/* Bottom strip — progress + mobile/tablet explanation (never over feather tips) */}
        <div className="relative z-50 border-t border-af-cyan/10 bg-af-bg/80 px-4 py-4 backdrop-blur-md lg:hidden">
          {chapterIdx > 0 ? (
            <div className="mx-auto max-w-md">
              <div className="mb-3 flex gap-1.5">
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.id}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i === chapterIdx ? "bg-af-cyan" : "bg-af-cyan/20",
                    )}
                  />
                ))}
              </div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-af-cyan">
                {chapter.num} — {chapter.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-af-muted">{chapter.desc}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {chapter.bullets.map((b) => (
                  <li key={b} className="text-xs text-af-text/80">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mx-auto flex max-w-md gap-1.5">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.id}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i === chapterIdx ? "bg-af-cyan" : "bg-af-cyan/20",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
