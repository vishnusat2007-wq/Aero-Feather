"use client";

import { formatPrice } from "@/lib/format";
import type { MonthBucket, StatusBucket } from "@/lib/admin-analytics";

export function RevenueBarChart({ data }: { data: MonthBucket[] }) {
  const max = Math.max(...data.map((d) => d.revenueCents), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Revenue by month</h2>
          <p className="text-sm text-slate-400">Last 6 months · paid & fulfilled orders</p>
        </div>
      </div>
      <div className="flex h-52 items-end gap-3">
        {data.map((m) => {
          const height = Math.max(4, Math.round((m.revenueCents / max) * 100));
          return (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
              <p className="text-[10px] font-medium text-af-cyan">
                {m.revenueCents > 0 ? formatPrice(m.revenueCents) : "—"}
              </p>
              <div className="flex h-40 w-full items-end rounded-t-md bg-white/5 px-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-af-blue to-af-cyan transition-all"
                  style={{ height: `${height}%` }}
                  title={`${m.label}: ${formatPrice(m.revenueCents)} · ${m.orderCount} orders`}
                />
              </div>
              <p className="text-[11px] text-slate-400">{m.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatusDonutChart({ data }: { data: StatusBucket[] }) {
  const total = Math.max(
    data.reduce((s, d) => s + d.count, 0),
    1,
  );
  const colors = [
    "#20b6e8",
    "#168cd8",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#a78bfa",
    "#94a3b8",
  ];

  const segments = data.reduce<
    Array<StatusBucket & { color: string; dash: number; offset: number }>
  >((acc, d, i) => {
    const pct = d.count / total;
    const dash = pct * 100;
    const offset = acc.reduce((s, seg) => s + seg.dash, 0);
    acc.push({
      ...d,
      color: colors[i % colors.length],
      dash,
      offset,
    });
    return acc;
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
      <h2 className="text-lg font-bold text-white">Orders by status</h2>
      <p className="mb-6 text-sm text-slate-400">Pipeline breakdown</p>

      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No orders yet — charts will fill as sales come in.</p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3.5"
            />
            {segments.map((s) => (
              <circle
                key={s.status}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={s.color}
                strokeWidth="3.5"
                strokeDasharray={`${s.dash} ${100 - s.dash}`}
                strokeDashoffset={-s.offset}
              />
            ))}
          </svg>
          <ul className="w-full space-y-2 text-sm">
            {segments.map((s) => (
              <li key={s.status} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 capitalize text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.status}
                </span>
                <span className="tabular-nums text-white">
                  {s.count} · {formatPrice(s.revenueCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
