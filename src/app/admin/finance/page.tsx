import Link from "next/link";
import { Euro, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { RevenueBarChart, StatusDonutChart } from "@/components/admin/finance-charts";
import { getFinanceSnapshot } from "@/lib/admin-analytics";
import { formatDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default async function FinancePage() {
  const finance = await getFinanceSnapshot();

  const cards = [
    {
      label: "Total revenue",
      value: formatPrice(finance.totalRevenueCents),
      icon: Euro,
      hint: "Paid & fulfilled",
    },
    {
      label: "Paid orders",
      value: finance.paidOrderCount,
      icon: ShoppingBag,
      hint: "Completed pipeline",
    },
    {
      label: "Avg order value",
      value: formatPrice(finance.averageOrderCents),
      icon: TrendingUp,
      hint: "Per paid order",
    },
    {
      label: "Pending",
      value: finance.pendingCount,
      icon: Clock,
      hint: "Awaiting payment",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
            Finance
          </p>
          <h1 className="mt-1 text-3xl font-bold text-af-text">Revenue & financing</h1>
          <p className="mt-1 max-w-xl text-af-muted">
            Track store revenue, order pipeline, and average order value — built for Aero
            Feather cashflow visibility.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">View all orders</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-2xl border border-af-border bg-af-surface p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-af-cyan/15 text-af-cyan">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm text-af-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-af-text">{value}</p>
            <p className="mt-1 text-xs text-af-muted">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueBarChart data={finance.monthly} />
        </div>
        <div className="lg:col-span-2">
          <StatusDonutChart data={finance.byStatus} />
        </div>
      </div>

      <section className="rounded-2xl border border-af-border bg-af-surface p-6">
        <h2 className="text-lg font-bold text-af-text">Recent paid orders</h2>
        <p className="mb-4 text-sm text-af-muted">Latest revenue-generating checkouts</p>
        {finance.recentPaid.length === 0 ? (
          <p className="text-sm text-af-muted">
            No paid orders yet. Charts update automatically after Stripe checkouts complete.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-af-muted">
                <tr>
                  <th className="px-2 py-2">Customer</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {finance.recentPaid.map((order) => (
                  <tr key={order.id} className="border-t border-af-border">
                    <td className="px-2 py-3 text-af-text">{order.email}</td>
                    <td className="px-2 py-3 font-medium text-af-text">
                      {formatPrice(order.total_cents)}
                    </td>
                    <td className="px-2 py-3 capitalize text-af-muted">{order.status}</td>
                    <td className="px-2 py-3 text-af-muted">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-af-cyan hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
