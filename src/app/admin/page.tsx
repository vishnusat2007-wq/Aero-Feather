import Link from "next/link";
import { Package, ShoppingBag, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getAdminStats, getAllOrders } from "@/lib/data";
import { getMaintenanceEnabled } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, maintenance] = await Promise.all([
    getAdminStats(),
    getAllOrders().then((orders) => orders.slice(0, 5)),
    getMaintenanceEnabled(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-slate-400">Manage your Aero Feather store</p>

      {maintenance && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Maintenance mode is <strong>ON</strong> — only admins can use the store.{" "}
          <Link href="/admin/website#maintenance" className="underline hover:text-white">
            Manage settings
          </Link>
        </div>
      )}

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
            className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-af-cyan/15 text-af-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button variant="cyan" asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">View all orders</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/website">Website Manager</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/finance">Finance</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/inventory">Inventory</Link>
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-white">Recent orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-slate-500">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1a34]">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-slate-200">{order.email}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      {formatPrice(order.total_cents)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">{order.status}</td>
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
