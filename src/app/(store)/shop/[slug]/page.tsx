import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/lib/data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const specs = Object.entries(product.specs ?? {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm text-af-muted transition-colors hover:text-af-cyan"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden border border-af-cyan/10 bg-af-surface">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-af-surface-elevated to-af-bg">
              <Image src="/logo.png" alt="" width={200} height={200} className="opacity-25" />
              <div className="h-48 w-20 border border-af-cyan/20 bg-af-bg/50" />
            </div>
          )}
        </div>

        <div>
          <Badge variant="cyan" className="mb-4 capitalize">{product.category}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-af-text sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-af-text">
              {formatPrice(product.price_cents)}
            </span>
            {product.compare_at_cents && (
              <span className="text-lg text-af-muted line-through">
                {formatPrice(product.compare_at_cents)}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-af-muted">{product.description}</p>

          {specs.length > 0 && (
            <dl className="mt-8 grid gap-0 border border-af-cyan/10 bg-af-surface">
              {specs.map(([key, value], i) => (
                <div
                  key={key}
                  className={`flex justify-between px-5 py-3.5 text-sm ${
                    i > 0 ? "border-t border-af-cyan/10" : ""
                  }`}
                >
                  <dt className="font-medium capitalize tracking-wide text-af-muted">{key}</dt>
                  <dd className="font-medium text-af-text">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 border-t border-af-cyan/10 pt-8">
            {product.stock > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <p className="font-medium text-red-400">Out of stock</p>
            )}
            <p className="mt-3 text-sm text-af-muted">{product.stock} in stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
