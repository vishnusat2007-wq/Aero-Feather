"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FadeIn } from "@/components/store/fade-in";
import { FlightCtaButton } from "@/components/store/flight-cta-button";
import {
  ShuttlecockShowcase,
  type HeroStage,
} from "@/components/store/shuttlecock-showcase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES: HeroStage[] = [
  { num: "01", label: "FLIGHT" },
  { num: "02", label: "FEATHER" },
  { num: "03", label: "DURABILITY" },
  { num: "04", label: "CONTROL" },
];

export function HeroSection() {
  const [stage, setStage] = useState<HeroStage>(STAGES[0]);
  const handleStageChange = useCallback((next: HeroStage) => setStage(next), []);

  return (
    <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:py-28">
      <div className="relative z-10 max-w-xl">
        <FadeIn>
          <p className="mb-6 inline-flex items-center gap-2 border border-af-cyan/25 bg-af-surface/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-af-cyan" />
            Engineered for Irish Badminton
          </p>
        </FadeIn>

        <FadeIn delay={80}>
          <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-af-text">
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

        {/* Stage indicator — synced to shuttlecock animation */}
        <FadeIn delay={200}>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-baseline gap-2 border-l-2 border-af-cyan/40 pl-4 transition-all duration-700">
              <span className="text-lg font-bold tabular-nums text-af-cyan">{stage.num}</span>
              <span className="text-[11px] font-semibold tracking-[0.2em] text-af-muted">/</span>
              <span
                key={stage.label}
                className="text-[11px] font-bold tracking-[0.2em] text-af-text uppercase animate-af-fade-up"
              >
                {stage.label}
              </span>
            </div>
            <div className="hidden gap-1 sm:flex">
              {STAGES.map((s) => (
                <span
                  key={s.num}
                  className={cn(
                    "h-1 w-5 rounded-full transition-all duration-500",
                    s.num === stage.num ? "bg-af-cyan" : "bg-af-cyan/15",
                  )}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={240}>
          <div className="mt-10 flex flex-wrap gap-4">
            <FlightCtaButton href="/shop">Shop Shuttlecocks</FlightCtaButton>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/#about">Discover Aero Feather</Link>
            </Button>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={120} className="relative z-10">
        <ShuttlecockShowcase onStageChange={handleStageChange} />
      </FadeIn>
    </div>
  );
}
