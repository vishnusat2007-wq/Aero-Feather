"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href.replace("/#", "/"));

  return (
    <Link
      href={href}
      className={cn(
        "group relative py-1 text-[13px] font-medium tracking-wide text-af-muted transition-colors hover:text-af-cyan",
        active && "text-af-text",
        className,
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-af-cyan to-af-blue transition-all duration-300 group-hover:w-full",
          active && "w-full",
        )}
      />
      <span className="absolute -bottom-0.5 left-0 h-px w-0 opacity-40 transition-all duration-500 group-hover:w-[120%] group-hover:-translate-x-[10%]">
        <svg viewBox="0 0 40 4" className="h-1 w-10" preserveAspectRatio="none">
          <path
            d="M0 2 Q10 0 20 2 T40 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-af-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </svg>
      </span>
    </Link>
  );
}
