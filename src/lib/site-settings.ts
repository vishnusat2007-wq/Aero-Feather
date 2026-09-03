import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type PerformanceItem = {
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
};

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

export type HomepageContent = {
  performance: {
    eyebrow: string;
    title: string;
    items: PerformanceItem[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: TestimonialItem[];
  };
};

export const DEFAULT_HOMEPAGE: HomepageContent = {
  performance: {
    eyebrow: "Engineering",
    title: "Performance you can feel.",
    items: [
      {
        title: "Stable Flight",
        desc: "Precision-weighted cork bases and calibrated feather selection for predictable trajectory in every hall.",
        metric: "±2%",
        metricLabel: "flight variance",
      },
      {
        title: "Exceptional Durability",
        desc: "Engineered for extended rally play — fewer mid-session replacements during training and league fixtures.",
        metric: "12+",
        metricLabel: "games per tube",
      },
      {
        title: "Tournament Consistency",
        desc: "Batch-tested for speed rating accuracy across 76, 77 and 78 — matched to Irish indoor conditions.",
        metric: "100%",
        metricLabel: "speed tested",
      },
      {
        title: "Selected Goose Feathers",
        desc: "Hand-selected premium goose feathers with natural curvature optimised for aerodynamic stability.",
        metric: "A+",
        metricLabel: "feather grade",
      },
    ],
  },
  testimonials: {
    eyebrow: "Social proof",
    title: "Trusted on court.",
    items: [
      {
        quote:
          "We've switched our entire club to Aero Feather Pro 77. The flight consistency in our Dublin hall is noticeably better — our players trust every tube.",
        author: "Marcus O'Brien",
        role: "Head Coach, Leinster BC",
        rating: 5,
      },
      {
        quote:
          "Finally a shuttlecock brand that understands Irish playing conditions. Speed 77 is perfect for our venue temperature.",
        author: "Sarah Lynch",
        role: "Competitive Player, Cork",
        rating: 5,
      },
      {
        quote:
          "Bulk ordering for our league was seamless. Quality is tournament-grade and delivery across Ireland was next-day.",
        author: "David Murphy",
        role: "Club Secretary, Galway BC",
        rating: 5,
      },
    ],
  },
};

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("af_site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.value) return fallback;
    return data.value as T;
  } catch {
    return fallback;
  }
}

export async function getMaintenanceEnabled(): Promise<boolean> {
  const value = await getSiteSetting<{ enabled?: boolean }>("maintenance", {
    enabled: false,
  });
  return Boolean(value.enabled);
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const value = await getSiteSetting<Partial<HomepageContent>>(
    "homepage",
    DEFAULT_HOMEPAGE,
  );
  return {
    performance: value.performance ?? DEFAULT_HOMEPAGE.performance,
    testimonials: value.testimonials ?? DEFAULT_HOMEPAGE.testimonials,
  };
}

export async function setSiteSetting(key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase.from("af_site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
