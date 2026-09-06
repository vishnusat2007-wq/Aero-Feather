import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { getSiteAnalyticsSnapshot } from "@/lib/site-analytics-data";
import {
  buildPreviewAnalyticsSnapshot,
  parseAnalyticsRange,
} from "@/lib/site-analytics";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; preview?: string }>;
}) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);
  const allowPreview =
    params.preview === "1" && process.env.NODE_ENV !== "production";

  const snapshot = allowPreview
    ? buildPreviewAnalyticsSnapshot(range)
    : await getSiteAnalyticsSnapshot(range);

  return <AnalyticsDashboard snapshot={snapshot} />;
}
