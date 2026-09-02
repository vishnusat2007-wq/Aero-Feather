"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents, clearCart } = useCartStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-navy">Your cart is empty</h1>
        <p className="mt-4 text-slate-600">Browse our shuttlecocks and add items to get started.</p>
        <Button variant="cyan" className="mt-8" asChild>
          <Link href="/shop">Shop now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-navy">Shopping cart</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <Image src="/logo.png" alt="" fill className="object-contain p-2 opacity-40" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/shop/${item.slug}`} className="font-semibold text-navy hover:text-cyan">
                    {item.name}
                  </Link>
                  <p className="text-sm text-slate-500">{formatPrice(item.priceCents)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="rounded-full border p-1 hover:bg-slate-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="rounded-full border p-1 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="ml-auto text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="font-bold text-navy">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy">Order summary</h2>
          <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatPrice(totalCents())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-navy">{formatPrice(totalCents())}</span>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="checkout-email">Email for order confirmation</Label>
            <Input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            variant="cyan"
            className="mt-6 w-full"
            onClick={checkout}
            disabled={loading}
          >
            {loading ? "Redirecting to Stripe…" : "Checkout with Stripe"}
          </Button>
          <p className="mt-3 text-center text-xs text-slate-400">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
