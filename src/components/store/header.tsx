"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop", label: "Shuttlecocks" },
  { href: "/#about", label: "About" },
  { href: "/#clubs", label: "Clubs & Teams" },
  { href: "/#contact", label: "Contact" },
];

export function StoreHeader() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/login");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAccountHref(data.user ? "/account" : "/login");
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-af-cyan/10 bg-af-bg/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[4.5rem]">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Aero Feather"
              width={40}
              height={40}
              className="transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-[13px] font-bold tracking-[0.18em] text-af-text">
                AERO FEATHER
              </p>
              <p className="text-[10px] tracking-widest text-af-muted uppercase">
                Premium Shuttlecocks
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium tracking-wide text-af-muted transition-colors hover:text-af-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={accountHref}
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-af-muted transition-colors hover:bg-af-surface hover:text-af-text"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-9 items-center gap-2 rounded-lg border border-af-cyan/25 bg-af-surface/60 px-3 text-[13px] font-semibold text-af-cyan transition-all hover:border-af-cyan/50 hover:bg-af-surface hover:shadow-[0_0_20px_rgba(32,182,232,0.15)]"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-af-cyan px-1 text-[10px] font-bold text-af-bg">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-af-muted transition-colors hover:bg-af-surface lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-af-bg/90 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col border-l border-af-cyan/10 bg-af-bg-secondary transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-af-cyan/10 px-5 py-4">
            <span className="text-sm font-semibold tracking-widest text-af-text">MENU</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="text-af-muted hover:text-af-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-af-muted transition-colors hover:bg-af-surface hover:text-af-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
