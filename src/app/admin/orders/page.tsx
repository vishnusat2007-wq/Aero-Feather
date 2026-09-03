import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { getAllOrders } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
        Finance
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-slate-400">{orders.length} total orders</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1a34]">
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
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-slate-200">{order.email}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {formatPrice(order.total_cents)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {order.status}
                  </Badge>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
