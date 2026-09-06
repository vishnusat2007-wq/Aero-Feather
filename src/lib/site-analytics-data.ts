import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  buildAnalyticsSnapshot,
  emptyAnalyticsSnapshot,
  rangeStart,
  type AnalyticsRange,
  type CheckoutOrderRow,
  type PageViewRow,
  type SiteAnalyticsSnapshot,
} from "@/lib/site-analytics";

const PAGE_VIEW_COLUMNS =
  "session_id, path, referrer_host, utm_source, utm_medium, utm_campaign, country, city, event_type, created_at";
const ORDER_COLUMNS = "id, email, status, total_cents, created_at, updated_at";

export async function getSiteAnalyticsSnapshot(
  range: AnalyticsRange,
  now = new Date(),
): Promise<SiteAnalyticsSnapshot> {
  if (!isSupabaseConfigured()) {
    return emptyAnalyticsSnapshot(range, now);
  }

  const since = rangeStart(range, now).toISOString();
  const supabase = await createClient();

  const [viewsResult, ordersResult] = await Promise.all([
    supabase
      .from("af_page_views")
      .select(PAGE_VIEW_COLUMNS)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
    supabase
      .from("af_orders")
      .select(ORDER_COLUMNS)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
  ]);

  const pageViews = (viewsResult.error ? [] : (viewsResult.data ?? [])) as PageViewRow[];
  const orders = (ordersResult.error ? [] : (ordersResult.data ?? [])) as CheckoutOrderRow[];

  return buildAnalyticsSnapshot({ range, now, pageViews, orders });
}
