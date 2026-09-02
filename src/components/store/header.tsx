"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

export function StoreHeader() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Aero Feather"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="hidden sm:block">
            <p className="text-lg font-bold tracking-wide text-navy">AERO FEATHER</p>
            <p className="text-xs text-slate-500">Premium shuttlecocks · Ireland</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="text-sm font-medium text-navy hover:text-cyan">
            Shop
          </Link>
          <Link href="/#about" className="text-sm font-medium text-navy hover:text-cyan">
            About
          </Link>
          <Link href="/#shipping" className="text-sm font-medium text-navy hover:text-cyan">
            Shipping
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={email ? "/account" : "/login"} aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="cyan" size="sm" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
