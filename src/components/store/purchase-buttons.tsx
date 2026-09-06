"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ADDED_TO_CART_LABEL } from "@/lib/cart-copy";
import { useCartStore } from "@/lib/cart-store";
import { cartItemFromProduct, startStripeCheckout } from "@/lib/start-checkout";
import type { Product } from "@/lib/types";

export function PurchaseButtons({
  product,
  initialEmail = "",
}: {
  product: Product;
  initialEmail?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const maxQty = Math.max(1, product.stock);
  const busy = product.stock <= 0 || buying;

  function clamp(n: number) {
    return Math.min(maxQty, Math.max(1, n));
  }

  function onAddToCart() {
    addItem(cartItemFromProduct(product), quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function onBuyNow() {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter your email to continue to Stripe Checkout.");
      return;
    }

    setBuying(true);
    try {
      await startStripeCheckout([cartItemFromProduct(product, quantity)], trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBuying(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label htmlFor="qty" className="mb-2 block text-xs tracking-wider text-af-muted uppercase">
            Quantity
          </Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={busy || quantity <= 1}
              onClick={() => setQuantity((q) => clamp(q - 1))}
              className="flex h-11 w-11 items-center justify-center border border-af-cyan/20 text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-text disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(clamp(Number(e.target.value) || 1))}
              className="h-11 w-16 border border-af-cyan/20 bg-af-bg text-center text-sm font-semibold text-af-text outline-none focus:border-af-cyan/50"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={busy || quantity >= maxQty}
              onClick={() => setQuantity((q) => clamp(q + 1))}
              className="flex h-11 w-11 items-center justify-center border border-af-cyan/20 text-af-muted transition-colors hover:border-af-cyan/40 hover:text-af-text disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-w-[220px] flex-1">
          <Label
            htmlFor="buy-email"
            className="mb-2 block text-xs tracking-wider text-af-muted uppercase"
          >
            Email for receipt
          </Label>
          <Input
            id="buy-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={busy}
          onClick={() => void onBuyNow()}
        >
          <Zap className="h-5 w-5" />
          {buying ? "Opening Stripe…" : "Buy now — Stripe Checkout"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={busy}
          aria-live="polite"
          onClick={onAddToCart}
        >
          <ShoppingBag className="h-5 w-5" />
          {added ? ADDED_TO_CART_LABEL : "Add to cart"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-af-muted">
        Buy now opens Stripe hosted Checkout in EUR. Shipping address is collected on Stripe.
      </p>
    </div>
  );
}
