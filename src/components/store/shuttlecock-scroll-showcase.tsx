"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CHAPTERS,
  getChapterIndex,
  getHeroStage,
  getScrollAnim,
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
      const next = Math.abs(delta) < 0.0005 ? target : current + delta * 0.2;
      smoothRef.current = next;
      setProgress(next);
      if (Math.abs(target - next) >= 0.0005) raf = requestAnimationFrame(tick);
      else raf = 0;
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
  const chapter = CHAPTERS[chapterIdx];
  const showGhosts = anim.openAmount > 0.02;
  const showCallouts = showGhosts && !anim.closing;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  const featherScale = 1 + anim.featherSpread;
  const baseOpacity = 1 - anim.openAmount * 0.28;

  return (
    <div ref={trackRef} className="relative h-[560vh]">
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
              className="relative mx-auto w-full"
              style={{ aspectRatio: `${IMG_W} / ${IMG_H}`, maxHeight: "min(64vh, 580px)" }}
            >
              {/* Always-intact shuttle — never sliced away */}
              <div className="absolute inset-0 z-20" style={{ opacity: baseOpacity }}>
                <Image
                  src={SHUTTLE_SRC}
                  alt="Premium goose-feather badminton shuttlecock"
                  width={IMG_W}
                  height={IMG_H}
                  priority
                  className="h-full w-full object-contain"
                  style={{
                    filter:
                      anim.highlight === "cork"
                        ? `drop-shadow(0 0 ${12 + anim.corkGlow * 20}px rgba(32,182,232,0.4))`
                        : undefined,
                  }}
                />
              </div>

              {/* Lifted feather ghost — settles back onto the body when closing */}
              {showGhosts && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-30 overflow-hidden"
                  style={{
                    height: "46%",
                    opacity: anim.openAmount,
                    transform: `translate3d(0, -${anim.featherLift}px, 0) scale(${featherScale})`,
                    transformOrigin: "50% 100%",
                    willChange: "transform, opacity",
                    filter:
                      anim.highlight === "feathers" || anim.highlight === "geometry"
                        ? "drop-shadow(0 10px 18px rgba(32,182,232,0.28))"
                        : "drop-shadow(0 10px 16px rgba(0,0,0,0.25))",
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[218%]">
                    <Image
                      src={SHUTTLE_SRC}
                      alt=""
                      width={IMG_W}
                      height={IMG_H}
                      className="h-full w-full object-contain object-top"
                    />
                  </div>
                </div>
              )}

              {/* Lifted binding ghost */}
              {showGhosts && anim.bindingLift > 0.5 && (
                <div
                  className="pointer-events-none absolute inset-x-[10%] z-30 overflow-hidden"
                  style={{
                    top: "40%",
                    height: "14%",
                    opacity: Math.min(1, anim.openAmount * 1.15),
                    transform: `translate3d(0, -${anim.bindingLift}px, 0)`,
                    willChange: "transform, opacity",
                    filter:
                      anim.highlight === "binding"
                        ? "drop-shadow(0 6px 12px rgba(32,182,232,0.3))"
                        : "drop-shadow(0 6px 10px rgba(0,0,0,0.2))",
                  }}
                >
                  <div className="absolute inset-x-[-12%] top-[-300%] h-[1400%]">
                    <Image
                      src={SHUTTLE_SRC}
                      alt=""
                      width={IMG_W}
                      height={IMG_H}
                      className="h-full w-full object-contain object-top"
                    />
                  </div>
                </div>
              )}

              {showCallouts && anim.featherLift > 16 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(18% - ${anim.featherLift * 0.15}px)`,
                    opacity: Math.min(1, anim.openAmount),
                  }}
                >
                  Feathers
                </div>
              )}
              {showCallouts && anim.bindingLift > 16 && (
                <div
                  className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded border border-af-cyan/30 bg-af-bg/80 px-2 py-0.5 text-[8px] font-bold tracking-widest text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(42% - ${anim.bindingLift * 0.2}px)`,
                    opacity: Math.min(1, anim.openAmount),
                  }}
                >
                  Binding
                </div>
              )}

              {anim.highlight === "geometry" && showCallouts && (
                <svg
                  className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible"
                  style={{
                    transform: `translateY(-${anim.featherLift}px) scale(${featherScale})`,
                    transformOrigin: "50% 100%",
                    opacity: anim.openAmount,
                  }}
                  aria-hidden
                >
                  {[26, 34, 42].map((y, i) => (
                    <ellipse
                      key={y}
                      cx="50%"
                      cy={`${y}%`}
                      rx={`${24 + i * 4}%`}
                      ry="3%"
                      fill="none"
                      stroke="#20B6E8"
                      strokeWidth="1.5"
                      opacity={0.45 - i * 0.08}
                      strokeDasharray="5 4"
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
