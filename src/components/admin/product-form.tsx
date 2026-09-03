"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveProductAction } from "@/app/admin/actions";
import type { Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        await saveProductAction(formData);
        router.refresh();
      }}
      className="max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-[#0d1a34] p-8 text-slate-200"
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product?.category ?? "professional"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (€)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compare_at">Compare at (€)</Label>
          <Input
            id="compare_at"
            name="compare_at"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.compare_at_cents
                ? (product.compare_at_cents / 100).toFixed(2)
                : ""
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={product?.image_url ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Active (visible in shop)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured on homepage
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="cyan">
          {product ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
