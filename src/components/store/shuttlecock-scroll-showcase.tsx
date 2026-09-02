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
  LAYER_CLIPS,
  PART_CALLOUTS,
  type HeroStage,
} from "@/components/store/shuttlecock-scroll-story";

export type { HeroStage };

const SHUTTLE_SRC = "/shuttlecock-hero-transparent.png";

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

function PartLayer({
  clipPath,
  transform,
  transformOrigin = "50% 50%",
  zIndex,
  glow,
  children,
}: {
  clipPath: string;
  transform: string;
  transformOrigin?: string;
  zIndex: number;
  glow?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 will-change-transform"
      style={{
        clipPath,
        WebkitClipPath: clipPath,
        transform,
        transformOrigin,
        transformStyle: "preserve-3d",
        zIndex,
      }}
    >
      <Image
        src={SHUTTLE_SRC}
        alt=""
        width={975}
        height={1364}
        priority
        className="h-full w-full object-contain"
        style={{
          filter: glow
            ? "brightness(1.08) contrast(1.1) drop-shadow(0 0 18px rgba(32,182,232,0.35))"
            : "brightness(1.04) contrast(1.06)",
        }}
      />
      {children}
    </div>
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

  const effectiveProgress = reducedMotion ? 0.38 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapterLocal = getChapterProgress(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const highlight = anim.highlight;

  const activeCallout =
    highlight && highlight !== "intro"
      ? PART_CALLOUTS.find((c) => c.id === (highlight === "geometry" ? "geometry" : highlight))
      : null;

  const calloutChapter =
    highlight === "geometry"
      ? CHAPTERS[2]
      : highlight
        ? CHAPTERS.find((c) => c.id === highlight)
        : null;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const featherScale = 1 + anim.featherSpread;
  const showExplodedGuides = anim.openAmount > 0.2;

  return (
    <div ref={trackRef} className="relative h-[520vh] sm:h-[580vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div
          className="relative mx-auto flex h-full w-full max-w-[620px] items-center justify-center px-2"
          style={{ perspective: "1200px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-500",
              progress > 0.06 ? "opacity-0" : "opacity-80",
            )}
          >
            <span className="text-[9px] font-semibold tracking-[0.2em] text-af-muted uppercase">
              Scroll to open each part
            </span>
            <span className="h-6 w-px animate-af-float bg-af-cyan/50" />
          </div>

          {/* Camera rig */}
          <div
            className="relative z-10 h-[min(74vh,640px)] w-full"
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
              className="relative mx-auto h-full w-[90%] max-w-[400px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Exploded-view connector lines between layers */}
              {showExplodedGuides && (
                <svg
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                  aria-hidden
                >
                  <line
                    x1="50%"
                    y1={`${48 - anim.featherLift * 0.04}%`}
                    x2="50%"
                    y2={`${52 - anim.bindingLift * 0.03}%`}
                    stroke="#20B6E8"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity={0.35 + anim.openAmount * 0.35}
                  />
                  <line
                    x1="50%"
                    y1={`${54 - anim.bindingLift * 0.03}%`}
                    x2="50%"
                    y2="58%"
                    stroke="#20B6E8"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity={0.35 + anim.openAmount * 0.35}
                  />
                </svg>
              )}

              {/* Cork base — anchored, never detaches */}
              <PartLayer
                clipPath={LAYER_CLIPS.cork}
                zIndex={10}
                glow={highlight === "cork"}
                transform={`translateZ(0px) translateY(${anim.corkGlow * 2}px)`}
              >
                {highlight === "cork" && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-af-cyan/8"
                    style={{ opacity: anim.corkGlow * 0.6 }}
                  />
                )}
              </PartLayer>

              {/* Binding band — lifts on scroll */}
              <PartLayer
                clipPath={LAYER_CLIPS.binding}
                zIndex={20}
                glow={highlight === "binding"}
                transform={`
                  translateY(-${anim.bindingLift}px)
                  translateZ(${anim.bindingLift * 0.4}px)
                `}
              />

              {/* Feather cone — lifts + blooms outward */}
              <PartLayer
                clipPath={LAYER_CLIPS.feathers}
                zIndex={30}
                glow={highlight === "feathers" || highlight === "geometry"}
                transformOrigin="50% 100%"
                transform={`
                  translateY(-${anim.featherLift}px)
                  translateZ(${anim.featherLift * 0.5}px)
                  scale(${featherScale})
                `}
              />

              {/* Full ghost outline when closed — fades as parts open */}
              <div
                className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300"
                style={{ opacity: Math.max(0, 1 - anim.openAmount * 1.4) }}
              >
                <Image
                  src={SHUTTLE_SRC}
                  alt="Premium goose-feather badminton shuttlecock"
                  width={975}
                  height={1364}
                  priority
                  className="h-full w-full object-contain opacity-40"
                />
              </div>

              {/* Active part highlight ring */}
              {highlight && highlight !== "intro" && (
                <div
                  className="pointer-events-none absolute z-40 animate-af-glow rounded-full border-2 border-af-cyan shadow-[0_0_28px_rgba(32,182,232,0.5)]"
                  style={{
                    top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                    left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                    width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                    height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                    opacity: 0.55 + chapterLocal * 0.45,
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

              {/* Geometry arcs on feather skirt */}
              {highlight === "geometry" && (
                <svg
                  className="pointer-events-none absolute inset-0 z-[35] h-full w-full"
                  style={{ transform: `translateY(-${anim.featherLift}px) scale(${featherScale})` }}
                  aria-hidden
                >
                  {[30, 38, 46].map((y, i) => (
                    <ellipse
                      key={y}
                      cx="50%"
                      cy={`${y}%`}
                      rx={`${24 + i * 4}%`}
                      ry="3%"
                      fill="none"
                      stroke="#20B6E8"
                      strokeWidth="1.5"
                      opacity={0.6 - i * 0.12}
                      strokeDasharray="5 4"
                    />
                  ))}
                </svg>
              )}

              <div className="pointer-events-none absolute inset-0 z-50 drop-shadow-[0_28px_56px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          {/* Part callout with leader line */}
          {activeCallout && calloutChapter && chapterIdx > 0 && (
            <div className="pointer-events-none absolute inset-0 z-50">
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <line
                  x1={`${activeCallout.anchorPct.x}%`}
                  y1={`${activeCallout.anchorPct.y - anim.featherLift * 0.05}%`}
                  x2={`${activeCallout.labelPct.x}%`}
                  y2={`${activeCallout.labelPct.y}%`}
                  stroke="#20B6E8"
                  strokeWidth="1.5"
                  opacity={0.7 + chapterLocal * 0.3}
                />
                <circle
                  cx={`${activeCallout.anchorPct.x}%`}
                  cy={`${activeCallout.anchorPct.y - anim.featherLift * 0.05}%`}
                  r="5"
                  fill="#20B6E8"
                  opacity={0.9}
                />
              </svg>

              <div
                className={cn(
                  "absolute hidden max-w-[190px] rounded-lg border border-af-cyan/50 bg-af-surface/95 px-3.5 py-3 shadow-[0_0_36px_rgba(32,182,232,0.2)] backdrop-blur-md sm:block",
                )}
                style={{
                  left: `${activeCallout.labelPct.x}%`,
                  top: `${activeCallout.labelPct.y}%`,
                  transform: activeCallout.align === "right" ? "translate(-100%, -50%)" : "translate(0, -50%)",
                  opacity: 0.85 + chapterLocal * 0.15,
                }}
              >
                <p className="text-[10px] font-bold tracking-[0.12em] text-af-cyan">
                  {calloutChapter.num} — {calloutChapter.title}
                </p>
                <p className="mt-1.5 text-[9px] leading-snug text-af-muted">{calloutChapter.desc}</p>
                <ul className="mt-2 space-y-0.5">
                  {calloutChapter.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-[8px] text-af-text/80">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-af-cyan" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Mobile part card */}
          {chapterIdx > 0 && (
            <div
              className="absolute bottom-8 left-1/2 z-50 w-[min(94%,340px)] -translate-x-1/2 rounded-lg border border-af-cyan/40 bg-af-surface/95 px-4 py-3 shadow-lg backdrop-blur-md sm:hidden"
              style={{ opacity: 0.9 + chapterLocal * 0.1 }}
            >
              <p className="text-[11px] font-bold tracking-[0.1em] text-af-cyan">
                {chapter.num} — {chapter.title}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-af-muted">{chapter.desc}</p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {chapter.bullets.map((b) => (
                  <li key={b} className="text-[9px] text-af-text/75">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-[12%] left-1/2 z-0 h-12 w-52 -translate-x-1/2 rounded-full bg-white/10 blur-2xl dark:bg-black/30" />
        </div>
      </div>
    </div>
  );
}
