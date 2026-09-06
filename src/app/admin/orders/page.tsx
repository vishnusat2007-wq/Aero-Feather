import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrdersByStatuses } from "@/lib/data";
import {
  INCOMPLETE_CHECKOUT_STATUSES,
  STORE_ORDER_STATUSES,
  formatOrderStatus,
} from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showIncomplete = view === "incomplete";
  const orders = await getOrdersByStatuses(
    showIncomplete ? INCOMPLETE_CHECKOUT_STATUSES : STORE_ORDER_STATUSES,
  );

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
        Finance
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-slate-400">
        {showIncomplete
          ? `${orders.length} incomplete or abandoned checkouts`
          : `${orders.length} confirmed store orders`}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold transition",
            !showIncomplete
              ? "bg-af-cyan text-[#060b18]"
              : "border border-white/10 text-slate-300 hover:bg-white/5",
          )}
        >
          Store orders
        </Link>
        <Link
          href="/admin/orders?view=incomplete"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold transition",
            showIncomplete
              ? "bg-af-cyan text-[#060b18]"
              : "border border-white/10 text-slate-300 hover:bg-white/5",
          )}
        >
          Incomplete checkouts
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1a34]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {showIncomplete
                    ? "No incomplete checkouts."
                    : "No confirmed store orders yet."}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-200">{order.email}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {formatPrice(order.total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{formatOrderStatus(order.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
