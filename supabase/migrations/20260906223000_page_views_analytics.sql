-- First-party storefront analytics (page views + coarse attribution).
-- Apply in the Supabase SQL Editor after earlier Aero Feather migrations,
-- or with `supabase db push` against a linked project.
--
-- Privacy: session UUID only (no auth user id), path without query string,
-- referrer host (not full URL), optional UTM tokens, country/city from
-- Vercel geo headers. Raw IPs are never stored.

CREATE TABLE IF NOT EXISTS public.af_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'page_view'
    CHECK (event_type IN ('page_view', 'checkout_start')),
  path TEXT NOT NULL CHECK (char_length(path) BETWEEN 1 AND 300 AND path LIKE '/%'),
  referrer_host TEXT CHECK (referrer_host IS NULL OR char_length(referrer_host) <= 253),
  utm_source TEXT CHECK (utm_source IS NULL OR char_length(utm_source) <= 80),
  utm_medium TEXT CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 80),
  utm_campaign TEXT CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 80),
  country TEXT CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),
  city TEXT CHECK (city IS NULL OR char_length(city) <= 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS af_page_views_created_at_idx
  ON public.af_page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS af_page_views_session_created_idx
  ON public.af_page_views (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS af_page_views_event_created_idx
  ON public.af_page_views (event_type, created_at DESC);

ALTER TABLE public.af_page_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.af_page_views FROM PUBLIC;
GRANT INSERT ON TABLE public.af_page_views TO anon, authenticated;
GRANT SELECT ON TABLE public.af_page_views TO authenticated;
GRANT ALL ON TABLE public.af_page_views TO service_role;

DROP POLICY IF EXISTS "page_views_insert_public" ON public.af_page_views;
CREATE POLICY "page_views_insert_public" ON public.af_page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    event_type IN ('page_view', 'checkout_start')
    AND path LIKE '/%'
    AND path NOT LIKE '//%'
    AND path NOT LIKE '/admin%'
    AND path NOT LIKE '/api%'
  );

DROP POLICY IF EXISTS "page_views_select_admin" ON public.af_page_views;
CREATE POLICY "page_views_select_admin" ON public.af_page_views
  FOR SELECT TO authenticated
  USING (public.is_admin());
