import type { CartItem } from "@/lib/types";
import type { Product } from "@/lib/types";

export function cartItemFromProduct(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: product.price_cents,
    imageUrl: product.image_url,
    quantity,
  };
}

export async function startStripeCheckout(items: CartItem[], email: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, email }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Checkout failed");
  if (!data.url) throw new Error("Stripe Checkout did not return a URL.");
  window.location.href = data.url;
}
