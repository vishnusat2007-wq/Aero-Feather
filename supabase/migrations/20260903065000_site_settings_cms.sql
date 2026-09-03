-- Site settings: maintenance mode + homepage CMS content

CREATE TABLE IF NOT EXISTS public.af_site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.af_site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON public.af_site_settings;
CREATE POLICY "settings_public_read" ON public.af_site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_admin_write" ON public.af_site_settings;
CREATE POLICY "settings_admin_write" ON public.af_site_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
