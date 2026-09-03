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
  const rawRef = useRef(0);
  const smoothRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  const readRawProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
    return Math.max(0, Math.min(1, -rect.top / scrollable));
  }, []);

  useEffect(() => {
    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      const target = rawRef.current;
      const current = smoothRef.current;
      const delta = target - current;
      const next = Math.abs(delta) < 0.0006 ? target : current + delta * 0.22;
      smoothRef.current = next;
      setProgress(next);
      if (Math.abs(target - next) >= 0.0006) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const queue = () => {
      rawRef.current = readRawProgress();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      document.documentElement.classList.add("af-hero-scrolling");
      queue();
    };

    rawRef.current = readRawProgress();
    smoothRef.current = rawRef.current;
    setProgress(rawRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.classList.remove("af-hero-scrolling");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", queue);
    };
  }, [readRawProgress]);

  const effectiveProgress = reducedMotion ? 0.42 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapterLocal = getChapterProgress(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const highlight = anim.highlight;
  const peeled = anim.openAmount > 0.05;
  const showCallouts = peeled && !anim.closing;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const featherScale = 1 + anim.featherSpread;

  return (
    <div ref={trackRef} className="relative h-[520vh]">
      <div className="sticky top-0 grid h-[100svh] grid-rows-[1fr_auto] overflow-hidden pt-16 lg:overflow-visible lg:pt-4">
        <div
          className="relative flex min-h-0 items-center justify-center px-2 pb-2"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute left-1/2 top-1 z-40 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300 sm:top-2 lg:top-0",
              progress > 0.04 ? "pointer-events-none opacity-0" : "opacity-90",
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
              willChange: "transform",
            }}
          >
            <div
              className="relative mx-auto w-full overflow-visible"
              style={{
                aspectRatio: `${IMG_W} / ${IMG_H}`,
                maxHeight: "min(64vh, 580px)",
              }}
            >
              {showCallouts && anim.featherLift > 10 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(44% - ${anim.featherLift}px - 14px)`,
                    opacity: Math.min(1, anim.openAmount * 1.6),
                  }}
                >
                  Feathers
                </div>
              )}
              {showCallouts && anim.bindingLift > 10 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(48% - ${anim.bindingLift}px - 14px)`,
                    opacity: Math.min(1, anim.openAmount * 1.6),
                  }}
                >
                  Binding
                </div>
              )}

              {showCallouts && (
                <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible" aria-hidden>
                  {anim.featherLift > 12 && (
                    <line
                      x1="50%"
                      y1={`${44 - anim.featherLift * 0.08}%`}
                      x2="50%"
                      y2="44%"
                      stroke="#20B6E8"
                      strokeWidth="2"
                      strokeDasharray="4 5"
                      opacity={0.45}
                    />
                  )}
                  {anim.bindingLift > 12 && (
                    <line
                      x1="50%"
                      y1={`${52 - anim.bindingLift * 0.08}%`}
                      x2="50%"
                      y2="52%"
                      stroke="#20B6E8"
                      strokeWidth="2"
                      strokeDasharray="4 5"
                      opacity={0.45}
                    />
                  )}
                </svg>
              )}

              {/* Cork stays planted */}
              <div className="absolute inset-x-0 bottom-0 z-10 h-[52%] overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-[192%]">
                  <ShuttleImage
                    className="bottom-0 top-auto"
                    style={{
                      filter:
                        highlight === "cork"
                          ? `brightness(1.1) drop-shadow(0 0 ${16 + anim.corkGlow * 24}px rgba(32,182,232,0.45))`
                          : undefined,
                    }}
                  />
                </div>
              </div>

              {/* Binding band — no box, only translates */}
              <div
                className="absolute inset-x-[6%] z-20 overflow-hidden"
                style={{
                  top: "40%",
                  height: "13%",
                  opacity: peeled ? 1 : 0,
                  transform: `translate3d(0, -${anim.bindingLift}px, ${anim.bindingLift}px)`,
                  willChange: "transform",
                }}
              >
                <div className="absolute inset-x-[-8%] top-[-320%] h-[1500%]">
                  <ShuttleImage
                    style={{
                      filter:
                        highlight === "binding"
                          ? "brightness(1.1) drop-shadow(0 0 14px rgba(32,182,232,0.4))"
                          : undefined,
                    }}
                  />
                </div>
              </div>

              {/* Feather cone */}
              <div
                className="absolute inset-x-0 top-0 z-30 overflow-hidden"
                style={{
                  height: "44%",
                  opacity: peeled ? 1 : 0,
                  transform: `translate3d(0, -${anim.featherLift}px, ${anim.featherLift}px) scale(${featherScale})`,
                  transformOrigin: "50% 100%",
                  willChange: "transform",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[227%]">
                  <ShuttleImage
                    style={{
                      filter:
                        highlight === "feathers" || highlight === "geometry"
                          ? "brightness(1.08) drop-shadow(0 0 12px rgba(32,182,232,0.3))"
                          : undefined,
                    }}
                  />
                </div>
              </div>

              {/* Intact assembled shuttle — fades out as it opens, back in as it closes */}
              <div
                className="pointer-events-none absolute inset-0 z-40"
                style={{ opacity: anim.assembledOpacity }}
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

              {highlight && highlight !== "intro" && showCallouts && (
                <div
                  className="pointer-events-none absolute z-50 rounded-[42%] border border-af-cyan/40"
                  style={{
                    top: `${HIGHLIGHT_ZONES[highlight].top}%`,
                    left: `${HIGHLIGHT_ZONES[highlight].left}%`,
                    width: `${HIGHLIGHT_ZONES[highlight].width}%`,
                    height: `${HIGHLIGHT_ZONES[highlight].height}%`,
                    opacity: 0.28 + chapterLocal * 0.2,
                    boxShadow: "0 0 20px rgba(32,182,232,0.2)",
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

              {highlight === "geometry" && showCallouts && (
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
                      strokeWidth="1.75"
                      opacity={0.5 - i * 0.1}
                      strokeDasharray="6 4"
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>

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
