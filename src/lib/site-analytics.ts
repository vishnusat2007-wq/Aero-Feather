export const ANALYTICS_RANGES = ["today", "7d", "30d"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const PAGE_VIEW_EVENT = "page_view";
export const CHECKOUT_START_EVENT = "checkout_start";
export const ANALYTICS_EVENT_TYPES = [PAGE_VIEW_EVENT, CHECKOUT_START_EVENT] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const ANALYTICS_SESSION_STORAGE_KEY = "af_sid";
export const ANALYTICS_UTM_STORAGE_KEY = "af_utm";
export const ANALYTICS_SESSION_COOKIE = "af_sid";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTM_RE = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const PATH_RE = /^\/[A-Za-z0-9\-._/~%]*$/;
const MAX_PATH = 300;
const MAX_HOST = 253;
const MAX_CITY = 80;

export type PageViewRow = {
  session_id: string;
  path: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  city: string | null;
  event_type: string;
  created_at: string;
};

export type CheckoutOrderRow = {
  id: string;
  email: string;
  status: string;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type CountRow = {
  key: string;
  label: string;
  count: number;
};

export type SeriesBucket = {
  key: string;
  label: string;
  pageViews: number;
  uniqueVisitors: number;
};

export type AbandonedCheckoutRow = {
  id: string;
  email: string;
  status: string;
  total_cents: number;
  started_at: string;
  updated_at: string;
};

export type VisitorStats = {
  pageViews: number;
  uniqueVisitors: number;
  byPeriod: SeriesBucket[];
};

export type TrafficStats = {
  referrers: CountRow[];
  campaigns: CountRow[];
  countries: CountRow[];
};

export type FunnelStats = {
  started: number;
  completed: number;
  abandoned: number;
  conversionRate: number;
};

export type SiteAnalyticsSnapshot = {
  range: AnalyticsRange;
  since: string;
  visitors: VisitorStats;
  traffic: TrafficStats;
  funnel: FunnelStats;
  leavers: AbandonedCheckoutRow[];
  sample: boolean;
};

export type CollectEvent = {
  session_id: string;
  event_type: AnalyticsEventType;
  path: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  city: string | null;
};

export function parseAnalyticsRange(value: string | undefined | null): AnalyticsRange {
  if (value === "today" || value === "7d" || value === "30d") return value;
  return "7d";
}

/** Inclusive UTC window start for the selected range. */
export function rangeStart(range: AnalyticsRange, now: Date): Date {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  if (range === "today") return new Date(Date.UTC(y, m, d));
  const daysBack = range === "7d" ? 6 : 29;
  return new Date(Date.UTC(y, m, d - daysBack));
}

export function isTrackablePath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/admin") &&
    !path.startsWith("/api") &&
    !path.startsWith("/auth")
  );
}

export function sanitizeSessionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed.toLowerCase() : null;
}

export function sanitizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  let path = raw.split("?")[0]?.split("#")[0] ?? "/";
  if (path.length > MAX_PATH) path = path.slice(0, MAX_PATH);
  if (!PATH_RE.test(path)) return null;
  if (!isTrackablePath(path)) return null;
  return path || "/";
}

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "").split(":")[0] ?? "";
}

export function sanitizeReferrerHost(
  value: unknown,
  selfHosts: readonly string[] = [],
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const raw = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) {
    return null;
  }

  let host = "";
  try {
    if (raw.includes("://")) {
      const parsed = new URL(raw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      host = parsed.hostname;
    } else if (raw.startsWith("//")) {
      host = new URL(`https:${raw}`).hostname;
    } else {
      host = raw.split("/")[0] ?? "";
    }
  } catch {
    return null;
  }

  host = normalizeHost(host);
  if (!host || host === "localhost" || host.endsWith(".local") || !host.includes(".")) {
    return null;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  if (host.length > MAX_HOST || !/^[a-z0-9.-]+$/.test(host)) return null;

  const selves = new Set(selfHosts.map(normalizeHost).filter(Boolean));
  if (selves.has(host)) return null;

  return host;
}

export function sanitizeUtm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (!v || !UTM_RE.test(v)) return null;
  return v;
}

export function sanitizeCountry(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(v) ? v : null;
}

export function sanitizeCity(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep raw */
  }
  decoded = decoded.trim().slice(0, MAX_CITY);
  if (!decoded) return null;
  if (!/^[\p{L}\p{M}0-9\s.'-]+$/u.test(decoded)) return null;
  return decoded;
}

export function sanitizeEventType(value: unknown): AnalyticsEventType {
  return value === CHECKOUT_START_EVENT ? CHECKOUT_START_EVENT : PAGE_VIEW_EVENT;
}

export function parseCollectPayload(
  body: unknown,
  headers: {
    country?: string | null;
    city?: string | null;
    selfHost?: string | null;
  } = {},
): CollectEvent | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;

  const session_id = sanitizeSessionId(record.sessionId ?? record.session_id);
  const path = sanitizePath(record.path);
  if (!session_id || !path) return null;

  const selfHosts = headers.selfHost ? [headers.selfHost] : [];

  return {
    session_id,
    event_type: sanitizeEventType(record.eventType ?? record.event_type),
    path,
    referrer_host: sanitizeReferrerHost(
      record.referrerHost ?? record.referrer_host ?? record.referrer,
      selfHosts,
    ),
    utm_source: sanitizeUtm(record.utmSource ?? record.utm_source),
    utm_medium: sanitizeUtm(record.utmMedium ?? record.utm_medium),
    utm_campaign: sanitizeUtm(record.utmCampaign ?? record.utm_campaign),
    country: sanitizeCountry(headers.country),
    city: sanitizeCity(headers.city),
  };
}

function countryLabel(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcHourKey(date: Date): string {
  return date.toISOString().slice(0, 13);
}

function buildEmptySeries(range: AnalyticsRange, now: Date): SeriesBucket[] {
  const start = rangeStart(range, now);

  if (range === "today") {
    const buckets: SeriesBucket[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const at = new Date(start.getTime() + hour * 60 * 60 * 1000);
      buckets.push({
        key: utcHourKey(at),
        label: `${String(hour).padStart(2, "0")}:00`,
        pageViews: 0,
        uniqueVisitors: 0,
      });
    }
    return buckets;
  }

  const days = range === "7d" ? 7 : 30;
  const buckets: SeriesBucket[] = [];
  for (let i = 0; i < days; i += 1) {
    const at = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.push({
      key: utcDayKey(at),
      label:
        range === "30d"
          ? at.toLocaleDateString("en-IE", { day: "numeric", month: "short", timeZone: "UTC" })
          : at.toLocaleDateString("en-IE", {
              weekday: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
      pageViews: 0,
      uniqueVisitors: 0,
    });
  }
  return buckets;
}

function periodKey(iso: string, range: AnalyticsRange): string {
  const date = new Date(iso);
  return range === "today" ? utcHourKey(date) : utcDayKey(date);
}

function isPageViewEvent(type: string): boolean {
  return type === PAGE_VIEW_EVENT || type === "";
}

export function aggregateVisitors(
  rows: readonly PageViewRow[],
  range: AnalyticsRange,
  now: Date,
): VisitorStats {
  const views = rows.filter((row) => isPageViewEvent(row.event_type));
  const unique = new Set(views.map((row) => row.session_id));
  const byPeriod = buildEmptySeries(range, now);
  const periodMap = new Map(byPeriod.map((bucket) => [bucket.key, bucket]));
  const sessionsByPeriod = new Map<string, Set<string>>();

  for (const row of views) {
    const key = periodKey(row.created_at, range);
    const bucket = periodMap.get(key);
    if (!bucket) continue;
    bucket.pageViews += 1;
    let sessions = sessionsByPeriod.get(key);
    if (!sessions) {
      sessions = new Set();
      sessionsByPeriod.set(key, sessions);
    }
    sessions.add(row.session_id);
  }

  for (const [key, sessions] of sessionsByPeriod) {
    const bucket = periodMap.get(key);
    if (bucket) bucket.uniqueVisitors = sessions.size;
  }

  return {
    pageViews: views.length,
    uniqueVisitors: unique.size,
    byPeriod,
  };
}

function bump(map: Map<string, CountRow>, key: string, label: string) {
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    return;
  }
  map.set(key, { key, label, count: 1 });
}

function ranked(map: Map<string, CountRow>, limit = 8): CountRow[] {
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, limit);
}

export function aggregateTraffic(rows: readonly PageViewRow[], limit = 8): TrafficStats {
  const views = rows.filter((row) => isPageViewEvent(row.event_type));
  const referrers = new Map<string, CountRow>();
  const campaigns = new Map<string, CountRow>();
  const countries = new Map<string, CountRow>();

  for (const row of views) {
    const host = row.referrer_host ?? "direct";
    bump(referrers, host, host === "direct" ? "Direct / none" : host);

    const parts = [row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean);
    const campaignKey = parts.join("/") || "none";
    bump(campaigns, campaignKey, parts.length === 0 ? "No UTM" : parts.join(" / "));

    const country = row.country ?? "unknown";
    bump(
      countries,
      country,
      country === "unknown" ? "Unknown" : countryLabel(country),
    );
  }

  return {
    referrers: ranked(referrers, limit),
    campaigns: ranked(campaigns, limit),
    countries: ranked(countries, limit),
  };
}

/**
 * Keep aligned with `STORE_ORDER_STATUSES` / `INCOMPLETE_CHECKOUT_STATUSES`
 * in `order-status.ts`. Defaults stay local so Node tests do not need `@/` aliases.
 */
export const FUNNEL_COMPLETED_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const FUNNEL_ABANDONED_STATUSES = [
  "incomplete",
  "pending",
  "abandoned",
] as const;

export function isFunnelCompletedStatus(status: string): boolean {
  return (FUNNEL_COMPLETED_STATUSES as readonly string[]).includes(status);
}

export function isFunnelAbandonedStatus(status: string): boolean {
  return (FUNNEL_ABANDONED_STATUSES as readonly string[]).includes(status);
}

export function aggregateCheckoutFunnel(orders: readonly CheckoutOrderRow[]): FunnelStats {
  let started = 0;
  let completed = 0;
  let abandoned = 0;

  for (const order of orders) {
    started += 1;
    if (isFunnelCompletedStatus(order.status)) completed += 1;
    else if (isFunnelAbandonedStatus(order.status)) abandoned += 1;
  }

  return {
    started,
    completed,
    abandoned,
    conversionRate: started > 0 ? Math.round((completed / started) * 1000) / 10 : 0,
  };
}

export function listAbandonedCheckouts(
  orders: readonly CheckoutOrderRow[],
  limit = 20,
): AbandonedCheckoutRow[] {
  return orders
    .filter((order) => isFunnelAbandonedStatus(order.status))
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit)
    .map((order) => ({
      id: order.id,
      email: order.email?.trim() ? order.email : "—",
      status: order.status,
      total_cents: order.total_cents,
      started_at: order.created_at,
      updated_at: order.updated_at,
    }));
}

export function buildAnalyticsSnapshot(input: {
  range: AnalyticsRange;
  now?: Date;
  pageViews: readonly PageViewRow[];
  orders: readonly CheckoutOrderRow[];
  sample?: boolean;
}): SiteAnalyticsSnapshot {
  const now = input.now ?? new Date();
  const since = rangeStart(input.range, now);

  return {
    range: input.range,
    since: since.toISOString(),
    visitors: aggregateVisitors(input.pageViews, input.range, now),
    traffic: aggregateTraffic(input.pageViews),
    funnel: aggregateCheckoutFunnel(input.orders),
    leavers: listAbandonedCheckouts(input.orders),
    sample: Boolean(input.sample),
  };
}

export function emptyAnalyticsSnapshot(
  range: AnalyticsRange,
  now = new Date(),
): SiteAnalyticsSnapshot {
  return buildAnalyticsSnapshot({ range, now, pageViews: [], orders: [] });
}

/** Labeled fixture for local / empty-DB verification. Not used in production. */
export function buildPreviewAnalyticsSnapshot(
  range: AnalyticsRange = "7d",
  now = new Date(),
): SiteAnalyticsSnapshot {
  const since = rangeStart(range, now);
  const iso = (offsetHours: number) =>
    new Date(now.getTime() - offsetHours * 60 * 60 * 1000).toISOString();

  const sessionA = "11111111-1111-4111-8111-111111111111";
  const sessionB = "22222222-2222-4222-8222-222222222222";
  const sessionC = "33333333-3333-4333-8333-333333333333";

  const pageViews: PageViewRow[] = [
    {
      session_id: sessionA,
      path: "/",
      referrer_host: "google.com",
      utm_source: "google",
      utm_medium: "organic",
      utm_campaign: null,
      country: "IE",
      city: "Dublin",
      event_type: PAGE_VIEW_EVENT,
      created_at: iso(2),
    },
    {
      session_id: sessionA,
      path: "/shop",
      referrer_host: null,
      utm_source: "google",
      utm_medium: "organic",
      utm_campaign: null,
      country: "IE",
      city: "Dublin",
      event_type: PAGE_VIEW_EVENT,
      created_at: iso(1.8),
    },
    {
      session_id: sessionB,
      path: "/",
      referrer_host: "instagram.com",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "club-launch",
      country: "GB",
      city: "London",
      event_type: PAGE_VIEW_EVENT,
      created_at: iso(26),
    },
    {
      session_id: sessionC,
      path: "/cart",
      referrer_host: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      country: "IE",
      city: "Cork",
      event_type: PAGE_VIEW_EVENT,
      created_at: iso(5),
    },
    {
      session_id: sessionC,
      path: "/cart",
      referrer_host: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      country: "IE",
      city: "Cork",
      event_type: CHECKOUT_START_EVENT,
      created_at: iso(4.9),
    },
  ];

  const inWindow = pageViews.filter((row) => new Date(row.created_at) >= since);
  const orders: CheckoutOrderRow[] = [
    {
      id: "ord_paid_1",
      email: "club@example.com",
      status: "paid",
      total_cents: 4999,
      created_at: iso(20),
      updated_at: iso(19),
    },
    {
      id: "ord_paid_2",
      email: "player@example.com",
      status: "processing",
      total_cents: 2499,
      created_at: iso(8),
      updated_at: iso(7),
    },
    {
      id: "ord_leave_1",
      email: "alex@example.com",
      status: "incomplete",
      total_cents: 2499,
      created_at: iso(6),
      updated_at: iso(5),
    },
    {
      id: "ord_leave_2",
      email: "",
      status: "abandoned",
      total_cents: 7497,
      created_at: iso(30),
      updated_at: iso(4),
    },
  ].filter((order) => new Date(order.created_at) >= since);

  return buildAnalyticsSnapshot({
    range,
    now,
    pageViews: inWindow,
    orders,
    sample: true,
  });
}
