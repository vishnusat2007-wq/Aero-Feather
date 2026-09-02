"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square bg-gradient-to-br from-slate-50 to-cyan/10">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image src="/logo.png" alt="" width={120} height={120} className="opacity-30" />
          </div>
        )}
        {product.featured && (
          <Badge variant="cyan" className="absolute left-3 top-3">Featured</Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="outline">{product.category}</Badge>
          {product.stock <= 10 && product.stock > 0 && (
            <span className="text-xs text-amber-600">Only {product.stock} left</span>
          )}
        </div>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-lg font-bold text-navy group-hover:text-cyan">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-navy">{formatPrice(product.price_cents)}</p>
            {product.compare_at_cents && (
              <p className="text-sm text-slate-400 line-through">
                {formatPrice(product.compare_at_cents)}
              </p>
            )}
          </div>
          <Button
            variant="cyan"
            size="sm"
            disabled={product.stock === 0}
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                imageUrl: product.image_url,
              })
            }
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
