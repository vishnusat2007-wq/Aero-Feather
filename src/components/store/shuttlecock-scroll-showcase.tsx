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
  type HeroStage,
} from "@/components/store/shuttlecock-scroll-story";

export type { HeroStage };

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
    const raw = -rect.top / scrollable;
    setProgress(Math.max(0, Math.min(1, raw)));
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const effectiveProgress = reducedMotion ? 0.32 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapterLocal = getChapterProgress(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const skirtScale = 1 + anim.featherBloom;
  const highlight = anim.highlight;

  return (
    <div ref={trackRef} className="relative h-[420vh] sm:h-[480vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div
          className="relative mx-auto flex h-full w-full max-w-[560px] items-center justify-center px-2"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-500",
              progress > 0.08 ? "opacity-0" : "opacity-70",
            )}
          >
            <span className="text-[9px] font-semibold tracking-[0.2em] text-af-muted uppercase">
              Scroll to explore
            </span>
            <span className="h-6 w-px animate-af-float bg-af-cyan/50" />
          </div>

          {/* Camera rig — dolly + subtle tilt (car-site style) */}
          <div
            className="relative z-10 h-[min(72vh,620px)] w-full will-change-transform"
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
              className="relative mx-auto h-full w-[88%] max-w-[380px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Single photorealistic shuttle — feather skirt blooms from cork anchor */}
              <div
                className="relative h-full w-full"
                style={{
                  transform: `
                    translateZ(${anim.featherPeel * 0.3}px)
                    scale(${skirtScale})
                  `,
                  transformOrigin: "50% 72%",
                  transformStyle: "preserve-3d",
                }}
              >
                <Image
                  src="/shuttlecock-hero-transparent.png"
                  alt="Premium goose-feather badminton shuttlecock"
                  width={975}
                  height={1364}
                  priority
                  className="h-full w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] dark:drop-shadow-[0_28px_56px_rgba(0,0,0,0.65)]"
                  style={{
                    filter: `brightness(1.04) contrast(1.06) drop-shadow(0 0 ${12 + anim.corkGlow * 28}px rgba(32,182,232,${0.08 + anim.corkGlow * 0.2}))`,
                  }}
                />
              </div>

              {/* Binding band lift indicator */}
              {anim.bindingPeel > 4 && highlight === "binding" && (
                <div
                  className="pointer-events-none absolute inset-x-[22%] top-[48%] h-[3%] rounded-full border border-af-cyan/50 bg-af-cyan/5"
                  style={{
                    transform: `translateZ(${anim.bindingPeel}px) translateY(-${anim.bindingPeel * 0.15}px)`,
                    opacity: 0.4 + chapterLocal * 0.4,
                  }}
                />
              )}

              {/* Active part highlight ring */}
              {highlight && (
                <div
                  className="pointer-events-none absolute animate-af-glow rounded-full border-2 border-af-cyan/70 shadow-[0_0_24px_rgba(32,182,232,0.45)]"
                  style={{
                    top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                    left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                    width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                    height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                    opacity: 0.5 + chapterLocal * 0.5,
                    transform: `translateZ(${anim.featherPeel + 12}px)`,
                  }}
                />
              )}

              {/* Geometry arcs */}
              {highlight === "geometry" && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ transform: `translateZ(${anim.featherPeel + 16}px)` }}
                  aria-hidden
                >
                  {[32, 40, 48].map((y, i) => (
                    <ellipse
                      key={y}
                      cx="50%"
                      cy={`${y}%`}
                      rx={`${22 + i * 4}%`}
                      ry="3%"
                      fill="none"
                      stroke="#20B6E8"
                      strokeWidth="1.5"
                      opacity={0.55 - i * 0.12}
                      strokeDasharray="4 4"
                    />
                  ))}
                </svg>
              )}

              {/* Cork glow */}
              {highlight === "cork" && (
                <div
                  className="pointer-events-none absolute rounded-full bg-af-cyan/10 blur-md"
                  style={{
                    top: `${HIGHLIGHT_ZONES.cork.top}%`,
                    left: `${HIGHLIGHT_ZONES.cork.left}%`,
                    width: `${HIGHLIGHT_ZONES.cork.width}%`,
                    height: `${HIGHLIGHT_ZONES.cork.height}%`,
                    opacity: anim.corkGlow * 0.7,
                    transform: "translateZ(20px)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Chapter callout — desktop */}
          <div
            className={cn(
              "absolute right-0 top-1/2 z-30 hidden max-w-[170px] -translate-y-1/2 rounded-lg border border-af-cyan/40 bg-af-surface/95 px-3 py-3 shadow-[0_0_32px_rgba(32,182,232,0.15)] backdrop-blur-md transition-all duration-500 lg:block",
              chapterIdx === 0 && "translate-x-4 opacity-0",
            )}
            style={{ opacity: chapterIdx === 0 ? 0 : 0.85 + chapterLocal * 0.15 }}
          >
            <p className="text-[9px] font-bold tracking-[0.14em] text-af-cyan">
              {chapter.num} — {chapter.title}
            </p>
            <p className="mt-1.5 text-[8px] leading-snug text-af-muted">{chapter.desc}</p>
          </div>

          <div className="pointer-events-none absolute bottom-[14%] left-1/2 z-0 h-10 w-48 -translate-x-1/2 rounded-full bg-white/10 blur-2xl dark:bg-black/30" />
        </div>
      </div>
    </div>
  );
}
