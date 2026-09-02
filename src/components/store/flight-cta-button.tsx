"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlightCtaButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "af-btn-primary af-flight-line-btn group inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 text-[15px] font-semibold",
        className,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      <svg
        className="pointer-events-none absolute -bottom-px left-0 h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        viewBox="0 0 200 4"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 2 Q50 0 100 2 T200 2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
      </svg>
    </Link>
  );
}
