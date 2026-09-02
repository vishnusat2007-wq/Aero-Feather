import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { FadeIn } from "@/components/store/fade-in";
import { getActiveProducts } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getActiveProducts();
  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <FadeIn>
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
            Shop
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-af-text sm:text-5xl">
            Shuttlecocks
          </h1>
          <p className="mt-4 text-af-muted">
            Professional, club and practice ranges — shipped from Ireland
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={cn(
              "px-4 py-2 text-[13px] font-medium tracking-wide transition-colors",
              !category
                ? "bg-af-cyan/15 text-af-cyan border border-af-cyan/30"
                : "border border-af-cyan/10 text-af-muted hover:border-af-cyan/25 hover:text-af-text",
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat}`}
              className={cn(
                "px-4 py-2 text-[13px] font-medium capitalize tracking-wide transition-colors",
                category === cat
                  ? "bg-af-cyan/15 text-af-cyan border border-af-cyan/30"
                  : "border border-af-cyan/10 text-af-muted hover:border-af-cyan/25 hover:text-af-text",
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      </FadeIn>

      {filtered.length === 0 ? (
        <p className="text-af-muted">No products in this category yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <FadeIn key={product.id} delay={i * 60}>
              <ProductCard product={product} featured />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
