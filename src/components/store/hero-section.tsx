"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FadeIn } from "@/components/store/fade-in";
import { FlightCtaButton } from "@/components/store/flight-cta-button";
import {
  CHAPTERS,
  type HeroStage,
} from "@/components/store/shuttlecock-scroll-story";
import { ShuttlecockScrollShowcase } from "@/components/store/shuttlecock-scroll-showcase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const [stage, setStage] = useState<HeroStage>({ num: "01", label: "FLIGHT" });
  const [chapterIdx, setChapterIdx] = useState(0);
  const chapter = CHAPTERS[chapterIdx];

  const handleStageChange = useCallback((next: HeroStage) => setStage(next), []);
  const handleChapterChange = useCallback((idx: number) => setChapterIdx(idx), []);

  return (
    <section className="af-radial-hero af-grid-bg relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-af-bg pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Left — sticky copy while scrolling through shuttle story */}
        <div className="relative z-20 px-4 py-16 sm:px-6 lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-20">
          <FadeIn>
            <p className="mb-6 inline-flex items-center gap-2 border border-af-cyan/25 bg-af-surface/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-af-cyan" />
              Engineered for Irish Badminton
            </p>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-af-text">
              ENGINEERED
              <br />
              FOR <span className="af-gradient-text">FLIGHT.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-af-muted sm:text-lg">
              Tournament-grade goose feather shuttlecocks engineered for consistent
              flight, durability and performance — developed for clubs and competitive
              players across Ireland.
            </p>
          </FadeIn>

          {/* Scroll-synced chapter copy — desktop only; stays left so shuttle stays clear */}
          <div className="mt-8 hidden min-h-[140px] lg:block">
            <ol className="mb-5 flex items-center gap-2" aria-label="Shuttlecock parts">
              {CHAPTERS.map((c, i) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center text-sm font-bold tabular-nums transition-colors duration-300",
                      i === chapterIdx
                        ? "border border-af-cyan/50 bg-af-cyan/15 text-af-cyan"
                        : i < chapterIdx
                          ? "text-af-cyan/70"
                          : "text-af-muted/50",
                    )}
                  >
                    {Number(c.num)}
                  </span>
                  {i < CHAPTERS.length - 1 && (
                    <span className="h-px w-3 bg-af-cyan/20" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
            <div className="flex items-baseline gap-2 border-l-2 border-af-cyan/40 pl-4 transition-all duration-500">
              <span className="text-xl font-bold tabular-nums text-af-cyan">{stage.num}</span>
              <span className="text-[11px] font-semibold tracking-[0.2em] text-af-muted">/</span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-af-text uppercase">
                {stage.label}
              </span>
            </div>
            <div key={chapter.id} className="mt-5 animate-af-fade-up">
              <p className="text-base font-bold tracking-wide text-af-text">{chapter.title}</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-af-muted">{chapter.desc}</p>
              <ul className="mt-4 space-y-2">
                {chapter.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-af-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-af-cyan" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-3 text-[10px] font-medium tracking-[0.18em] text-af-muted uppercase lg:hidden">
            Scroll to explore the shuttlecock →
          </p>

          <FadeIn delay={240}>
            <div className="mt-8 flex flex-wrap gap-4">
              <FlightCtaButton href="/shop">Shop Shuttlecocks</FlightCtaButton>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/#about">Discover Aero Feather</Link>
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* Right — scroll-driven shuttlecock story (single scroll track) */}
        <ShuttlecockScrollShowcase
          onStageChange={handleStageChange}
          onChapterChange={handleChapterChange}
        />
      </div>
    </section>
  );
}
