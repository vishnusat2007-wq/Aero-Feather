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

const PART_LABEL: Record<string, { text: string; top: string }> = {
  feathers: { text: "Feathers", top: "18%" },
  geometry: { text: "Geometry", top: "30%" },
  binding: { text: "Binding", top: "48%" },
  cork: { text: "Cork", top: "74%" },
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
      const next = Math.abs(delta) < 0.0004 ? target : current + delta * 0.18;
      smoothRef.current = next;
      setProgress(next);
      if (Math.abs(target - next) >= 0.0004) raf = requestAnimationFrame(tick);
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

  const effectiveProgress = reducedMotion ? 0.18 : progress;
  const anim = getScrollAnim(effectiveProgress);
  const chapterIdx = getChapterIndex(effectiveProgress);
  const chapter = CHAPTERS[chapterIdx];
  const label = anim.highlight ? PART_LABEL[anim.highlight] : null;

  useEffect(() => {
    onStageChange?.(getHeroStage(effectiveProgress));
    onChapterChange?.(chapterIdx);
  }, [effectiveProgress, onStageChange, onChapterChange, chapterIdx]);

  return (
    <div ref={trackRef} className="relative h-[560vh]">
      <div className="sticky top-0 grid h-[100svh] grid-rows-[1fr_auto] overflow-visible pt-16 lg:pt-4">
        <div className="relative flex min-h-0 items-center justify-center px-2 pb-2">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,0.12)_0%,rgba(32,182,232,0.08)_38%,transparent_72%)]" />

          <div
            className={cn(
              "absolute left-1/2 top-1 z-40 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300 sm:top-2 lg:top-0",
              progress > 0.04 ? "pointer-events-none opacity-0" : "opacity-90",
            )}
          >
            <span className="rounded-md border border-af-cyan/25 bg-af-bg/80 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-af-cyan uppercase backdrop-blur-sm">
              Scroll to explore each part
            </span>
            <span className="h-5 w-px animate-af-float bg-af-cyan/60" />
          </div>

            <div
            className="relative z-10 w-full max-w-[400px] overflow-visible bg-transparent lg:max-w-[420px]"
            style={{
              aspectRatio: `${IMG_W} / ${IMG_H}`,
              maxHeight: "min(68vh, 620px)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `
                  translate3d(0, ${anim.imgY}px, 0)
                  scale(${anim.imgScale})
                  rotateY(${anim.tiltY}deg)
                  rotateX(${anim.tiltX}deg)
                `,
                transformOrigin: "50% 55%",
                willChange: "transform",
              }}
            >
              <Image
                src={SHUTTLE_SRC}
                alt="Premium goose-feather badminton shuttlecock"
                width={IMG_W}
                height={IMG_H}
                priority
                draggable={false}
                className="h-full w-full object-contain"
                style={{
                  filter: anim.glow
                    ? `drop-shadow(0 0 ${10 + anim.glow * 18}px rgba(32,182,232,${0.18 + anim.glow * 0.2}))`
                    : undefined,
                }}
              />
            </div>

            {label && (
              <div
                className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md border border-af-cyan/30 bg-af-bg/80 px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-af-cyan uppercase backdrop-blur-sm"
                style={{ top: label.top, opacity: 0.35 + anim.inspect * 0.65 }}
              >
                {label.text}
              </div>
            )}
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
