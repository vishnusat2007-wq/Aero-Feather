import Link from "next/link";
import { Package, ShoppingBag, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getAdminStats, getAllOrders } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getAdminStats(),
    getAllOrders().then((orders) => orders.slice(0, 5)),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-slate-600">Manage your Aero Feather store</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { label: "Products", value: stats.productCount, icon: Package },
          { label: "Orders", value: stats.orderCount, icon: ShoppingBag },
          {
            label: "Revenue",
            value: formatPrice(stats.revenueCents),
            icon: TrendingUp,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-navy">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <Button variant="cyan" asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">View all orders</Link>
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-navy">Recent orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-slate-500">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{order.email}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total_cents)}
                    </td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString("en-IE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
