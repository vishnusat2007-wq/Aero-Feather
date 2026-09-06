import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_UTM_STORAGE_KEY,
  CHECKOUT_START_EVENT,
  PAGE_VIEW_EVENT,
  sanitizeSessionId,
  type AnalyticsEventType,
} from "@/lib/site-analytics";

type UtmSet = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

function randomSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const r = Math.floor(Math.random() * 16);
    const v = char === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateAnalyticsSessionId(): string {
  if (typeof window === "undefined") return randomSessionId();

  try {
    const stored = sanitizeSessionId(localStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY));
    if (stored) {
      persistSessionId(stored);
      return stored;
    }
  } catch {
    /* private mode */
  }

  const created = randomSessionId();
  persistSessionId(created);
  return created;
}

function persistSessionId(id: string) {
  try {
    localStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${ANALYTICS_SESSION_COOKIE}=${id}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readFirstTouchUtms(search: string): UtmSet {
  const params = new URLSearchParams(search);
  const fromUrl: UtmSet = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  };

  if (fromUrl.source || fromUrl.medium || fromUrl.campaign) {
    try {
      sessionStorage.setItem(ANALYTICS_UTM_STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      /* ignore */
    }
    return fromUrl;
  }

  try {
    const raw = sessionStorage.getItem(ANALYTICS_UTM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UtmSet>;
      return {
        source: parsed.source ?? null,
        medium: parsed.medium ?? null,
        campaign: parsed.campaign ?? null,
      };
    }
  } catch {
    /* ignore */
  }

  return { source: null, medium: null, campaign: null };
}

export function sendAnalyticsEvent(input: {
  eventType?: AnalyticsEventType;
  path?: string;
  search?: string;
}) {
  if (typeof window === "undefined") return;

  const path = input.path ?? window.location.pathname;
  const search = input.search ?? window.location.search;
  const utm = readFirstTouchUtms(search);
  const payload = {
    sessionId: getOrCreateAnalyticsSessionId(),
    path,
    referrer: document.referrer || null,
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    eventType: input.eventType ?? PAGE_VIEW_EVENT,
  };

  const body = JSON.stringify(payload);
  const url = "/api/analytics/collect";

  try {
    if (typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackCheckoutStart() {
  sendAnalyticsEvent({ eventType: CHECKOUT_START_EVENT, path: "/cart" });
}
