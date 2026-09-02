"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { LogoMark } from "@/components/store/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

function spec(product: Product, key: string, fallback = "—") {
  return product.specs?.[key] ?? fallback;
}

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <article className="af-card-hover group flex flex-col overflow-hidden rounded-xl border border-af-cyan/10 bg-af-surface">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-af-bg-secondary"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-af-surface-elevated to-af-bg">
            <LogoMark size={80} className="opacity-25 transition-opacity group-hover:opacity-35" />
            <div className="h-40 w-16 rounded-sm border border-af-cyan/20 bg-af-surface/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-af-bg/80 via-transparent to-transparent opacity-60" />
        {product.featured && (
          <Badge variant="cyan" className="absolute left-4 top-4">
            Featured
          </Badge>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute right-4 top-4 text-[11px] font-medium tracking-wide text-amber-400/90 uppercase">
            {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="muted" className="capitalize">{product.category}</Badge>
          {spec(product, "speed") !== "—" && (
            <span className="text-[11px] tracking-wider text-af-muted uppercase">
              Speed {spec(product, "speed")}
            </span>
          )}
        </div>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-lg font-bold tracking-tight text-af-text transition-colors group-hover:text-af-cyan">
            {product.name}
          </h3>
        </Link>

        {featured && (
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-af-cyan/10 pt-4">
            <div>
              <dt className="text-[10px] tracking-widest text-af-muted uppercase">Feather</dt>
              <dd className="mt-0.5 text-xs font-medium text-af-text">{spec(product, "material")}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-widest text-af-muted uppercase">Speed</dt>
              <dd className="mt-0.5 text-xs font-medium text-af-text">{spec(product, "speed")}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-widest text-af-muted uppercase">Tube</dt>
              <dd className="mt-0.5 text-xs font-medium text-af-text">{spec(product, "quantity")}</dd>
            </div>
          </dl>
        )}

        {!featured && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-af-muted">
            {product.description}
          </p>
        )}

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-af-cyan/10 pt-5">
          <div>
            <p className="text-xl font-bold tracking-tight text-af-text">
              {formatPrice(product.price_cents)}
            </p>
            {product.compare_at_cents && (
              <p className="text-sm text-af-muted line-through">
                {formatPrice(product.compare_at_cents)}
              </p>
            )}
          </div>
          <Button
            variant="primary"
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
            <Plus className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
