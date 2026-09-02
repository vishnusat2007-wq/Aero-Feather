import Image from "next/image";
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-cyan/10">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Image src="/logo.png" alt="" width={240} height={240} className="opacity-40" />
            </div>
          )}
        </div>
        <div>
          <Badge variant="cyan" className="mb-4 capitalize">{product.category}</Badge>
          <h1 className="text-4xl font-bold text-navy">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-navy">
              {formatPrice(product.price_cents)}
            </span>
            {product.compare_at_cents && (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.compare_at_cents)}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          {specs.length > 0 && (
            <dl className="mt-8 grid gap-3 rounded-2xl border border-slate-200 p-6">
              {specs.map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <dt className="font-medium capitalize text-navy">{key}</dt>
                  <dd className="text-slate-600">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            {product.stock > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <p className="font-medium text-red-600">Out of stock</p>
            )}
            <p className="mt-2 text-sm text-slate-500">{product.stock} in stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
