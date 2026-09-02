import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getActiveProducts } from "@/lib/data";

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-navy">Shop shuttlecocks</h1>
        <p className="mt-2 text-slate-600">
          Professional, club, and practice ranges — shipped from Ireland
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            !category ? "bg-navy text-white" : "bg-slate-100 text-navy hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/shop?category=${cat}`}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              category === cat
                ? "bg-navy text-white"
                : "bg-slate-100 text-navy hover:bg-slate-200"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500">No products in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
