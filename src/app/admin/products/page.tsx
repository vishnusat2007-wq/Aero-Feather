import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { getAllProducts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
            Website Manager
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Products</h1>
          <p className="mt-1 text-slate-400">{products.length} products in catalogue</p>
        </div>
        <Button variant="cyan" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1a34]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-200">{formatPrice(product.price_cents)}</td>
                <td className="px-4 py-3 text-slate-200">{product.stock}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.active ? "cyan" : "outline"}>
                    {product.active ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button variant="ghost" size="sm" type="submit" className="text-red-400">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
