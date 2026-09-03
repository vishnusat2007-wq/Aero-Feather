"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CHAPTERS,
  HIGHLIGHT_ZONES,
  LAYER_CLIPS,
  PART_CALLOUTS,
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

function ShuttleLayer({
  clipPath,
  transform,
  transformOrigin = "50% 50%",
  zIndex,
  glow,
  alt,
}: {
  clipPath: string;
  transform: string;
  transformOrigin?: string;
  zIndex: number;
  glow?: boolean;
  alt?: string;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        clipPath,
        WebkitClipPath: clipPath,
        transform,
        transformOrigin,
        zIndex,
        willChange: "transform",
      }}
    >
      <Image
        src={SHUTTLE_SRC}
        alt={alt ?? ""}
        width={IMG_W}
        height={IMG_H}
        priority
        draggable={false}
        className="h-full w-full object-contain"
        style={{
          filter: glow
            ? "brightness(1.06) drop-shadow(0 0 16px rgba(32,182,232,0.32))"
            : undefined,
        }}
      />
    </div>
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
      const next = Math.abs(delta) < 0.00035 ? target : current + delta * 0.26;
      smoothRef.current = next;
      setProgress(next);
      if (Math.abs(target - next) >= 0.00035) raf = requestAnimationFrame(tick);
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

  const effectiveProgress = reducedMotion ? 0 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const callout = anim.highlight ? PART_CALLOUTS.find((c) => c.id === anim.highlight) : null;
  const zone = anim.highlight ? HIGHLIGHT_ZONES[anim.highlight] : null;
  const opened = anim.openAmount > 0.12;
  const featherScale = 1 + anim.featherSpread;

  const labelLift =
    anim.highlight === "feathers" || anim.highlight === "geometry"
      ? anim.featherLift
      : anim.highlight === "binding"
        ? anim.bindingLift
        : anim.highlight === "cork"
          ? -anim.corkDrop
          : 0;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  return (
    <div ref={trackRef} className="relative h-[600vh]">
      <div className="sticky top-0 grid h-[100svh] grid-rows-[1fr_auto] overflow-visible pt-16 lg:pt-4">
        <div
          className="relative flex min-h-0 items-center justify-center overflow-visible px-2 pb-2"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

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

          <div className="relative z-10 flex h-full w-full max-w-[460px] items-center justify-center overflow-visible px-[8%] py-[12%] lg:max-w-[500px]">
            <div
              className="relative w-full overflow-visible bg-transparent"
              style={{
                aspectRatio: `${IMG_W} / ${IMG_H}`,
                maxHeight: "min(54vh, 480px)",
                transform: `
                  translate3d(0, ${anim.imgY}px, 0)
                  scale(${anim.imgScale})
                  rotateY(${anim.tiltY}deg)
                  rotateX(${anim.tiltX}deg)
                `,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {opened && (
                <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible" aria-hidden>
                  <line
                    x1="50%"
                    y1={`${46 - anim.featherLift * 0.08}%`}
                    x2="50%"
                    y2={`${52 - anim.bindingLift * 0.06}%`}
                    stroke="#20B6E8"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    opacity={0.25 + anim.openAmount * 0.4}
                  />
                  <line
                    x1="50%"
                    y1={`${58 - anim.bindingLift * 0.05}%`}
                    x2="50%"
                    y2={`${70 + anim.corkDrop * 0.04}%`}
                    stroke="#20B6E8"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    opacity={0.25 + anim.openAmount * 0.4}
                  />
                </svg>
              )}

              <ShuttleLayer
                clipPath={LAYER_CLIPS.cork}
                zIndex={10}
                glow={anim.highlight === "cork"}
                alt="Premium goose-feather badminton shuttlecock"
                transform={`translate3d(0, ${anim.corkDrop}px, 0)`}
              />
              <ShuttleLayer
                clipPath={LAYER_CLIPS.binding}
                zIndex={20}
                glow={anim.highlight === "binding"}
                transform={`translate3d(0, -${anim.bindingLift}px, ${anim.bindingLift * 0.25}px)`}
              />
              <ShuttleLayer
                clipPath={LAYER_CLIPS.feathers}
                zIndex={30}
                glow={anim.highlight === "feathers" || anim.highlight === "geometry"}
                transformOrigin="50% 100%"
                transform={`translate3d(0, -${anim.featherLift}px, ${anim.featherLift * 0.3}px) scale(${featherScale})`}
              />

              {anim.highlight === "geometry" && (
                <svg
                  className="pointer-events-none absolute inset-0 z-[35] h-full w-full overflow-visible"
                  style={{
                    transform: `translateY(-${anim.featherLift}px) scale(${featherScale})`,
                    transformOrigin: "50% 100%",
                  }}
                  aria-hidden
                >
                  {[30, 38, 46].map((y, i) => (
                    <ellipse
                      key={y}
                      cx="50%"
                      cy={`${y}%`}
                      rx={`${22 + i * 4}%`}
                      ry="2.6%"
                      fill="none"
                      stroke="#20B6E8"
                      strokeWidth="1.25"
                      opacity={0.55 - i * 0.12}
                      strokeDasharray="5 4"
                    />
                  ))}
                </svg>
              )}

              {zone && (
                <div
                  className="pointer-events-none absolute z-40 rounded-full border border-af-cyan/60 shadow-[0_0_18px_rgba(32,182,232,0.3)]"
                  style={{
                    top: `${zone.top}%`,
                    left: `${zone.left}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                    opacity: 0.25 + anim.inspect * 0.55,
                    transform: `translateY(-${labelLift}px)`,
                  }}
                />
              )}

              {callout && (
                <div
                  className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md border border-af-cyan/30 bg-af-bg/80 px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-af-cyan uppercase backdrop-blur-sm"
                  style={{
                    top: `calc(${callout.top}% - ${labelLift * 0.35}px)`,
                    opacity: 0.35 + anim.inspect * 0.65,
                  }}
                >
                  {callout.text}
                </div>
              )}

              {anim.assemblingLabel > 0.04 && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[4%] z-50 -translate-x-1/2 rounded-md border border-af-cyan/25 bg-af-bg/70 px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-af-cyan uppercase backdrop-blur-sm"
                  style={{ opacity: anim.assemblingLabel }}
                >
                  Assembling
                </div>
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
                      "h-1.5 flex-1 rounded-full transition-all duration-300",
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
                    "h-1.5 flex-1 rounded-full",
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
