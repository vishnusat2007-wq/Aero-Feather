"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

/** Clears the cart after a successful Stripe redirect. */
export function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    try {
      sessionStorage.removeItem("af-pending-checkout");
    } catch {
      /* ignore */
    }
  }, [clearCart]);

  return null;
}
