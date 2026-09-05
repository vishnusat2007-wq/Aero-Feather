"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/store/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents } = useCartStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes("@")) {
        throw new Error("Enter a valid email for your order confirmation.");
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (!data.url) throw new Error("No Stripe checkout URL returned");

      try {
        sessionStorage.setItem("af-pending-checkout", "1");
      } catch {
        /* ignore */
      }
      // Do not clear cart here — success page clears after payment.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-af-text">Your cart is empty</h1>
        <p className="mt-4 text-af-muted">Browse our shuttlecocks and add items to get started.</p>
        <Button variant="primary" className="mt-8" asChild>
          <Link href="/shop">Shop now</Link>
        </Button>
      </div>
    );
  }

  const subtotal = totalCents();
  const shippingHint = subtotal >= 7500 ? "Free" : "From €4.95";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-af-text">Shopping cart</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 border border-af-cyan/10 bg-af-surface p-5"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-af-bg-secondary">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <LogoMark size={48} className="opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-semibold text-af-text transition-colors hover:text-af-cyan"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-af-muted">{formatPrice(item.priceCents)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center border border-af-cyan/20 text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-text"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center border border-af-cyan/20 text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-text"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="ml-auto text-af-muted transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="font-bold text-af-text">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="h-fit border border-af-cyan/15 bg-af-surface p-6">
          <h2 className="text-lg font-bold text-af-text">Order summary</h2>
          <div className="mt-4 space-y-2 border-b border-af-cyan/10 pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-af-muted">Subtotal</span>
              <span className="font-medium text-af-text">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-af-muted">Shipping</span>
              <span className="font-medium text-af-muted">{shippingHint}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span className="text-af-text">Total</span>
            <span className="text-af-cyan">{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="checkout-email">Email for order confirmation</Label>
            <Input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <Button
            variant="primary"
            className="mt-6 w-full"
            onClick={() => void checkout()}
            disabled={loading}
          >
            {loading ? "Redirecting to Stripe…" : "Checkout with Stripe"}
          </Button>
          <p className="mt-3 text-center text-xs text-af-muted">
            Secure payment powered by Stripe · Aero Feather
          </p>
        </div>
      </div>
    </div>
  );
}
