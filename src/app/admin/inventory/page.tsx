import Link from "next/link";
import { AlertTriangle, Boxes, PackageMinus, Warehouse } from "lucide-react";
import { updateStockAction } from "@/app/admin/actions";
import { getInventorySnapshot } from "@/lib/admin-analytics";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function InventoryPage() {
  const inventory = await getInventorySnapshot();

  const cards = [
    {
      label: "SKUs",
      value: inventory.skuCount,
      icon: Boxes,
    },
    {
      label: "Units in stock",
      value: inventory.totalUnits,
      icon: Warehouse,
    },
    {
      label: "Inventory value",
      value: formatPrice(inventory.totalValueCents),
      icon: Warehouse,
    },
    {
      label: "Needs attention",
      value: inventory.lowStockCount + inventory.outOfStockCount,
      icon: AlertTriangle,
      warn: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
            Website Manager
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Inventory</h1>
          <p className="mt-1 max-w-xl text-slate-400">
            Monitor stock levels, inventory value, and quickly restock low items.
            Low stock threshold: under 40 units.
          </p>
        </div>
        <Button variant="cyan" asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, warn }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-5",
              warn
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-white/10 bg-[#0d1a34]",
            )}
          >
            <div
              className={cn(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-full",
                warn ? "bg-amber-500/20 text-amber-300" : "bg-af-cyan/15 text-af-cyan",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {(inventory.lowStockCount > 0 || inventory.outOfStockCount > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <PackageMinus className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {inventory.outOfStockCount > 0 && (
              <span>{inventory.outOfStockCount} out of stock. </span>
            )}
            {inventory.lowStockCount > 0 && (
              <span>{inventory.lowStockCount} running low — restock soon.</span>
            )}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1a34]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {inventory.rows.map((row) => (
              <tr key={row.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.category}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      row.status === "ok" && "border-emerald-500/40 text-emerald-300",
                      row.status === "low" && "border-amber-500/40 text-amber-300",
                      row.status === "out" && "border-red-500/40 text-red-300",
                    )}
                  >
                    {row.status === "ok"
                      ? "Healthy"
                      : row.status === "low"
                        ? "Low"
                        : "Out"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {formatPrice(row.price_cents)}
                </td>
                <td className="px-4 py-3 font-semibold text-white">{row.stock}</td>
                <td className="px-4 py-3 text-slate-300">
                  {formatPrice(row.valueCents)}
                </td>
                <td className="px-4 py-3">
                  <form action={updateStockAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <Input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={row.stock}
                      className="h-9 w-24 border-white/10 bg-[#060b18] text-white"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
