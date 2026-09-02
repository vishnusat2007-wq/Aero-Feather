"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  return (
    <Button
      variant="cyan"
      size="lg"
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.price_cents,
          imageUrl: product.image_url,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
    >
      <ShoppingBag className="h-5 w-5" />
      {added ? "Added to cart!" : "Add to cart"}
    </Button>
  );
}
