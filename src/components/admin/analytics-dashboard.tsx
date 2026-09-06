import Link from "next/link";
import { Eye, Users, CreditCard, UserMinus, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/format";
import { formatOrderStatus } from "@/lib/order-status";
import type { AnalyticsRange, CountRow, SiteAnalyticsSnapshot } from "@/lib/site-analytics";
import { cn } from "@/lib/utils";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function RangeTabs({ range }: { range: AnalyticsRange }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Analytics range">
      {RANGES.map((item) => {
        const active = item.value === range;
        return (
          <Link
            key={item.value}
            href={`/admin/analytics?range=${item.value}`}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-af-cyan text-[#060b18]"
                : "border border-white/10 text-slate-300 hover:bg-white/5",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-af-cyan/15 text-af-cyan">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function VisitorChart({ snapshot }: { snapshot: SiteAnalyticsSnapshot }) {
  const series = snapshot.visitors.byPeriod;
  const max = Math.max(...series.map((point) => point.pageViews), 1);
  const compact = series.length > 12;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Page views</h2>
        <p className="text-sm text-slate-400">
          {snapshot.range === "today"
            ? "Hourly · UTC · first-party beacons"
            : "Daily · UTC · unique sessions counted separately"}
        </p>
      </div>
      {snapshot.visitors.pageViews === 0 ? (
        <p className="text-sm text-slate-500">
          No page views in this range yet. Browse the storefront to record a session.
        </p>
      ) : (
        <div className="flex h-52 items-end gap-1 sm:gap-2">
          {series.map((point, index) => {
            const height = Math.max(4, Math.round((point.pageViews / max) * 100));
            const showLabel =
              !compact || index === 0 || index === series.length - 1 || index % 5 === 0;
            return (
              <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-t-md bg-white/5">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-af-blue to-af-cyan"
                    style={{ height: `${height}%` }}
                    title={`${point.label}: ${point.pageViews} views · ${point.uniqueVisitors} visitors`}
                  />
                </div>
                <p className="h-8 text-center text-[10px] leading-tight text-slate-400">
                  {showLabel ? point.label : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankedList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: CountRow[];
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-200">{row.label}</span>
                <span className="tabular-nums text-white">{row.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-af-cyan"
                  style={{ width: `${Math.max(8, Math.round((row.count / max) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Funnel({ snapshot }: { snapshot: SiteAnalyticsSnapshot }) {
  const { started, completed, abandoned } = snapshot.funnel;
  const steps = [
    { label: "Checkout started", value: started, hint: "Stripe session created" },
    { label: "Payment completed", value: completed, hint: "Paid, fulfilled, refunded" },
    { label: "Left / abandoned", value: abandoned, hint: "Incomplete checkout" },
  ];
  const max = Math.max(started, 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Checkout funnel</h2>
          <p className="text-sm text-slate-400">
            From order statuses · {snapshot.funnel.conversionRate}% start to paid
          </p>
        </div>
        <Link
          href="/admin/orders?view=incomplete"
          className="text-sm text-af-cyan hover:underline"
        >
          Incomplete checkouts
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-xl border border-white/5 bg-[#060b18] p-4">
            <p className="text-sm text-slate-400">{step.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{step.value}</p>
            <p className="mt-1 text-xs text-slate-500">
              {percent(step.value, max)}% of starts · {step.hint}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-af-blue to-af-cyan"
                style={{ width: `${Math.max(step.value > 0 ? 8 : 0, percent(step.value, max))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ snapshot }: { snapshot: SiteAnalyticsSnapshot }) {
  const rangeLabel =
    snapshot.range === "today" ? "today" : snapshot.range === "7d" ? "last 7 days" : "last 30 days";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
            Insights
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-1 max-w-2xl text-slate-400">
            First-party visitors, traffic sources, and checkout drop-off for {rangeLabel}.
            Session-based uniques — no third-party pixels.
          </p>
        </div>
        <RangeTabs range={snapshot.range} />
      </div>

      {snapshot.sample && (
        <div className="rounded-xl border border-af-cyan/30 bg-af-cyan/10 px-4 py-3 text-sm text-cyan-100">
          Showing sample numbers for local verification. Real traffic appears after the
          page-views migration is applied and shoppers browse the store.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page views"
          value={snapshot.visitors.pageViews}
          hint="Storefront paths recorded"
          icon={Eye}
        />
        <StatCard
          label="Unique visitors"
          value={snapshot.visitors.uniqueVisitors}
          hint="Anonymous session IDs"
          icon={Users}
        />
        <StatCard
          label="Checkouts started"
          value={snapshot.funnel.started}
          hint="Orders opened in Stripe"
          icon={CreditCard}
        />
        <StatCard
          label="Leavers"
          value={snapshot.funnel.abandoned}
          hint="Incomplete or abandoned"
          icon={UserMinus}
        />
      </div>

      <VisitorChart snapshot={snapshot} />

      <div className="grid gap-6 lg:grid-cols-3">
        <RankedList
          title="Traffic sources"
          empty="No referrer hosts yet — most first visits are direct."
          rows={snapshot.traffic.referrers}
        />
        <RankedList
          title="UTM campaigns"
          empty="No UTM source / medium / campaign in this range."
          rows={snapshot.traffic.campaigns}
        />
        <RankedList
          title="Countries"
          empty="Country is filled from Vercel geo headers on ingest."
          rows={snapshot.traffic.countries}
        />
      </div>

      <Funnel snapshot={snapshot} />

      <section className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Drop-off / leavers</h2>
            <p className="text-sm text-slate-400">
              Incomplete checkouts in this range — email if collected, start time, last status.
            </p>
          </div>
          <Globe className="h-4 w-4 text-af-cyan/70" />
        </div>
        {snapshot.leavers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No abandoned checkouts in this window.{" "}
            <Link href="/admin/orders?view=incomplete" className="text-af-cyan hover:underline">
              View all incomplete checkouts
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Started</th>
                  <th className="px-2 py-2">Last status</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {snapshot.leavers.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="px-2 py-3 text-slate-200">{row.email}</td>
                    <td className="px-2 py-3 text-slate-500">{formatDate(row.started_at)}</td>
                    <td className="px-2 py-3">
                      <Badge variant="outline">{formatOrderStatus(row.status)}</Badge>
                    </td>
                    <td className="px-2 py-3 font-medium text-white">
                      {formatPrice(row.total_cents)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link href={`/admin/orders/${row.id}`} className="text-af-cyan hover:underline">
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
