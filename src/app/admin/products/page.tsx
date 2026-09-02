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
          <h1 className="text-3xl font-bold text-navy">Products</h1>
          <p className="mt-1 text-slate-600">{products.length} products in catalogue</p>
        </div>
        <Button variant="cyan" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
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
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.slug}</p>
                </td>
                <td className="px-4 py-3">{formatPrice(product.price_cents)}</td>
                <td className="px-4 py-3">{product.stock}</td>
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
                      <Button variant="ghost" size="sm" type="submit" className="text-red-600">
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
