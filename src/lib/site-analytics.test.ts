import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isIncompleteCheckoutStatus,
  isStoreOrderStatus,
} from "./order-status.ts";
import {
  aggregateCheckoutFunnel,
  aggregateTraffic,
  aggregateVisitors,
  buildAnalyticsSnapshot,
  buildPreviewAnalyticsSnapshot,
  CHECKOUT_START_EVENT,
  FUNNEL_ABANDONED_STATUSES,
  FUNNEL_COMPLETED_STATUSES,
  isFunnelAbandonedStatus,
  isFunnelCompletedStatus,
  listAbandonedCheckouts,
  PAGE_VIEW_EVENT,
  parseAnalyticsRange,
  parseCollectPayload,
  rangeStart,
  sanitizeCity,
  sanitizeCountry,
  sanitizePath,
  sanitizeReferrerHost,
  sanitizeSessionId,
  sanitizeUtm,
  type CheckoutOrderRow,
  type PageViewRow,
} from "./site-analytics.ts";

const NOW = new Date("2026-09-06T15:30:00.000Z");
const SESSION = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function view(partial: Partial<PageViewRow> & { created_at: string }): PageViewRow {
  return {
    session_id: SESSION,
    path: "/",
    referrer_host: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    country: null,
    city: null,
    event_type: PAGE_VIEW_EVENT,
    ...partial,
  };
}

describe("parseAnalyticsRange", () => {
  it("accepts today, 7d, and 30d and defaults to 7d", () => {
    assert.equal(parseAnalyticsRange("today"), "today");
    assert.equal(parseAnalyticsRange("7d"), "7d");
    assert.equal(parseAnalyticsRange("30d"), "30d");
    assert.equal(parseAnalyticsRange("year"), "7d");
    assert.equal(parseAnalyticsRange(undefined), "7d");
  });
});

describe("rangeStart", () => {
  it("uses inclusive UTC calendar windows", () => {
    assert.equal(rangeStart("today", NOW).toISOString(), "2026-09-06T00:00:00.000Z");
    assert.equal(rangeStart("7d", NOW).toISOString(), "2026-08-31T00:00:00.000Z");
    assert.equal(rangeStart("30d", NOW).toISOString(), "2026-08-08T00:00:00.000Z");
  });
});

describe("payload sanitizers", () => {
  it("accepts anonymous UUID session ids only", () => {
    assert.equal(sanitizeSessionId(SESSION), SESSION);
    assert.equal(sanitizeSessionId("not-a-uuid"), null);
    assert.equal(sanitizeSessionId("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa "), SESSION);
  });

  it("keeps pathname only and drops admin, api, and query secrets", () => {
    assert.equal(sanitizePath("/shop/tournament?token=secret"), "/shop/tournament");
    assert.equal(sanitizePath("/admin/orders"), null);
    assert.equal(sanitizePath("/api/checkout"), null);
    assert.equal(sanitizePath("//evil.example"), null);
    assert.equal(sanitizePath("https://evil.example/shop"), null);
  });

  it("stores referrer host without query strings or self-referrals", () => {
    assert.equal(
      sanitizeReferrerHost("https://instagram.com/p/abc?utm_content=secret"),
      "instagram.com",
    );
    assert.equal(sanitizeReferrerHost("https://www.google.com/search?q=badminton"), "google.com");
    assert.equal(
      sanitizeReferrerHost("https://aero-feather.vercel.app/shop", ["aero-feather.vercel.app"]),
      null,
    );
    assert.equal(sanitizeReferrerHost("https://127.0.0.1/"), null);
    assert.equal(sanitizeReferrerHost("javascript:alert(1)"), null);
  });

  it("normalizes coarse UTM, country, and city values", () => {
    assert.equal(sanitizeUtm("Instagram"), "instagram");
    assert.equal(sanitizeUtm("has space"), null);
    assert.equal(sanitizeCountry("ie"), "IE");
    assert.equal(sanitizeCountry("IRL"), null);
    assert.equal(sanitizeCity("Dublin"), "Dublin");
    assert.equal(sanitizeCity("Cork%20City"), "Cork City");
  });

  it("builds a collect event from the client body and geo headers only", () => {
    const event = parseCollectPayload(
      {
        sessionId: SESSION,
        path: "/shop?utm_source=google",
        referrer: "https://www.google.com/search?q=aero",
        utmSource: "google",
        utmMedium: "organic",
        eventType: "page_view",
        ip: "1.2.3.4",
      },
      {
        country: "IE",
        city: "Dublin",
        selfHost: "localhost:3000",
      },
    );

    assert.ok(event);
    assert.equal(event.session_id, SESSION);
    assert.equal(event.path, "/shop");
    assert.equal(event.referrer_host, "google.com");
    assert.equal(event.utm_source, "google");
    assert.equal(event.country, "IE");
    assert.equal(event.city, "Dublin");
    assert.equal("ip" in event, false);
  });

  it("rejects untrackable or malformed collect payloads", () => {
    assert.equal(parseCollectPayload({ path: "/shop" }), null);
    assert.equal(
      parseCollectPayload({ sessionId: SESSION, path: "/admin" }, { country: "IE" }),
      null,
    );
  });
});

describe("visitor aggregation", () => {
  it("counts page views and unique sessions, ignoring checkout beacons", () => {
    const rows = [
      view({ created_at: "2026-09-06T10:00:00.000Z", session_id: SESSION }),
      view({ created_at: "2026-09-06T11:00:00.000Z", session_id: SESSION, path: "/shop" }),
      view({
        created_at: "2026-09-06T12:00:00.000Z",
        session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
      view({
        created_at: "2026-09-06T12:05:00.000Z",
        session_id: SESSION,
        event_type: CHECKOUT_START_EVENT,
        path: "/cart",
      }),
    ];

    const stats = aggregateVisitors(rows, "today", NOW);
    assert.equal(stats.pageViews, 3);
    assert.equal(stats.uniqueVisitors, 2);
    assert.equal(stats.byPeriod.length, 24);
    const ten = stats.byPeriod.find((bucket) => bucket.key === "2026-09-06T10");
    assert.equal(ten?.pageViews, 1);
    assert.equal(ten?.uniqueVisitors, 1);
  });

  it("fills 7 daily buckets for the week range", () => {
    const stats = aggregateVisitors(
      [view({ created_at: "2026-09-01T08:00:00.000Z" })],
      "7d",
      NOW,
    );
    assert.equal(stats.byPeriod.length, 7);
    assert.equal(stats.byPeriod[0]?.key, "2026-08-31");
    assert.equal(stats.byPeriod.at(-1)?.key, "2026-09-06");
    assert.equal(stats.pageViews, 1);
  });
});

describe("traffic aggregation", () => {
  it("groups referrer hosts, UTM campaigns, and countries", () => {
    const rows = [
      view({
        created_at: "2026-09-06T10:00:00.000Z",
        referrer_host: "google.com",
        utm_source: "google",
        utm_medium: "organic",
        country: "IE",
      }),
      view({
        created_at: "2026-09-06T11:00:00.000Z",
        referrer_host: "google.com",
        utm_source: "google",
        utm_medium: "organic",
        country: "IE",
      }),
      view({
        created_at: "2026-09-05T11:00:00.000Z",
        referrer_host: null,
        country: "GB",
      }),
    ];

    const traffic = aggregateTraffic(rows);
    assert.equal(traffic.referrers[0]?.key, "google.com");
    assert.equal(traffic.referrers[0]?.count, 2);
    assert.equal(traffic.referrers[1]?.key, "direct");
    assert.equal(traffic.campaigns[0]?.key, "google/organic");
    assert.equal(traffic.countries[0]?.key, "IE");
    assert.equal(traffic.countries[0]?.label, "Ireland");
  });
});

describe("checkout funnel and leavers", () => {
  const orders: CheckoutOrderRow[] = [
    {
      id: "1",
      email: "paid@example.com",
      status: "paid",
      total_cents: 2500,
      created_at: "2026-09-06T10:00:00.000Z",
      updated_at: "2026-09-06T10:05:00.000Z",
    },
    {
      id: "2",
      email: "refund@example.com",
      status: "refunded",
      total_cents: 2500,
      created_at: "2026-09-06T09:00:00.000Z",
      updated_at: "2026-09-06T12:00:00.000Z",
    },
    {
      id: "3",
      email: "leave@example.com",
      status: "incomplete",
      total_cents: 1800,
      created_at: "2026-09-06T08:00:00.000Z",
      updated_at: "2026-09-06T08:01:00.000Z",
    },
    {
      id: "4",
      email: "",
      status: "abandoned",
      total_cents: 4000,
      created_at: "2026-09-05T08:00:00.000Z",
      updated_at: "2026-09-06T14:00:00.000Z",
    },
    {
      id: "5",
      email: "old@example.com",
      status: "pending",
      total_cents: 1000,
      created_at: "2026-09-04T08:00:00.000Z",
      updated_at: "2026-09-04T09:00:00.000Z",
    },
  ];

  it("keeps funnel buckets aligned with order-status helpers", () => {
    for (const status of [
      ...FUNNEL_COMPLETED_STATUSES,
      ...FUNNEL_ABANDONED_STATUSES,
      "unknown",
    ]) {
      assert.equal(isFunnelCompletedStatus(status), isStoreOrderStatus(status));
      assert.equal(isFunnelAbandonedStatus(status), isIncompleteCheckoutStatus(status));
    }
  });

  it("counts started, paid-or-refunded, and incomplete checkouts", () => {
    const funnel = aggregateCheckoutFunnel(orders);
    assert.equal(funnel.started, 5);
    assert.equal(funnel.completed, 2);
    assert.equal(funnel.abandoned, 3);
    assert.equal(funnel.conversionRate, 40);
  });

  it("lists leavers by latest status with email fallback", () => {
    const leavers = listAbandonedCheckouts(orders, 2);
    assert.equal(leavers.length, 2);
    assert.equal(leavers[0]?.id, "4");
    assert.equal(leavers[0]?.email, "—");
    assert.equal(leavers[0]?.status, "abandoned");
    assert.equal(leavers[1]?.email, "leave@example.com");
  });
});

describe("snapshot builders", () => {
  it("composes visitor, traffic, and funnel sections", () => {
    const snapshot = buildAnalyticsSnapshot({
      range: "today",
      now: NOW,
      pageViews: [view({ created_at: "2026-09-06T10:00:00.000Z", country: "IE" })],
      orders: [
        {
          id: "1",
          email: "a@b.com",
          status: "incomplete",
          total_cents: 100,
          created_at: "2026-09-06T10:00:00.000Z",
          updated_at: "2026-09-06T10:00:00.000Z",
        },
      ],
    });

    assert.equal(snapshot.visitors.pageViews, 1);
    assert.equal(snapshot.funnel.abandoned, 1);
    assert.equal(snapshot.sample, false);
    assert.equal(snapshot.since, "2026-09-06T00:00:00.000Z");
  });

  it("builds a labeled preview snapshot for empty local verification", () => {
    const snapshot = buildPreviewAnalyticsSnapshot("7d", NOW);
    assert.equal(snapshot.sample, true);
    assert.ok(snapshot.visitors.pageViews >= 1);
    assert.ok(snapshot.funnel.started >= 1);
    assert.ok(snapshot.leavers.length >= 1);
  });
});
