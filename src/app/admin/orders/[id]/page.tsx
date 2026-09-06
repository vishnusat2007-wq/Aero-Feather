import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderById, getOrderItems } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";

const statuses = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, items] = await Promise.all([
    getOrderById(id),
    getOrderItems(id),
  ]);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
        Finance
      </p>
      <h1 className="mt-1 text-3xl font-bold text-af-text">Order details</h1>
      <p className="mt-1 text-af-muted">{order.email}</p>

      <div className="mt-8 grid gap-6 rounded-2xl border border-af-border bg-af-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-af-muted">Order ID</p>
            <p className="font-mono text-sm text-af-text">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-af-muted">Date</p>
            <p className="text-af-text">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-af-muted">Total</p>
            <p className="text-xl font-bold text-af-text">{formatPrice(order.total_cents)}</p>
          </div>
          <div>
            <p className="text-sm text-af-muted">Status</p>
            <p className="capitalize text-af-text">{order.status}</p>
          </div>
        </div>

        {(order.shipping_line1 || order.shipping_name) && (
          <div>
            <h2 className="mb-2 font-semibold text-af-text">Shipping</h2>
            <p className="whitespace-pre-line text-sm text-af-muted">
              {[
                order.shipping_name,
                order.shipping_line1,
                order.shipping_line2,
                [order.shipping_city, order.shipping_county, order.shipping_postcode]
                  .filter(Boolean)
                  .join(", "),
                order.shipping_country,
              ]
                .filter(Boolean)
                .join("\n")}
            </p>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-semibold text-af-text">Items</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b border-af-border py-2 text-af-muted"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <form action={updateOrderStatusAction} className="flex items-end gap-4 border-t border-af-border pt-4">
          <input type="hidden" name="id" value={order.id} />
          <div className="space-y-2">
            <Label htmlFor="status">Update status</Label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              className="h-11 rounded-xl border border-af-border bg-af-bg px-4 text-sm text-af-text"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="cyan">
            Update
          </Button>
        </form>
      </div>
    </div>
  );
}
