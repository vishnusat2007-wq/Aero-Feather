-- Seed starter shuttlecock catalogue for Aero Feather (idempotent by slug)

INSERT INTO public.af_products (
  name,
  slug,
  description,
  price_cents,
  compare_at_cents,
  category,
  stock,
  active,
  featured,
  specs
)
VALUES
  (
    'Tournament Grade Goose Feather',
    'tournament-grade-goose-feather',
    'Club and competition tube of 12. Natural cork, hand-selected goose feathers, speed 77 for Irish halls.',
    3499,
    3999,
    'shuttlecocks',
    120,
    true,
    true,
    '{"material":"Goose feather","speed":"77","quantity":"12","cork":"Natural"}'::jsonb
  ),
  (
    'Match Day Pro Feather',
    'match-day-pro-feather',
    'Durable match shuttle for weekly leagues. Consistent flight, reinforced binding, speed 76.',
    2799,
    NULL,
    'shuttlecocks',
    200,
    true,
    true,
    '{"material":"Goose feather","speed":"76","quantity":"12","cork":"Composite"}'::jsonb
  ),
  (
    'Training Feather Tube',
    'training-feather-tube',
    'High-volume practice tube. Great value for drills and multi-shuttle sessions.',
    1999,
    2499,
    'shuttlecocks',
    300,
    true,
    false,
    '{"material":"Duck feather","speed":"77","quantity":"12","cork":"Composite"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  compare_at_cents = EXCLUDED.compare_at_cents,
  stock = GREATEST(public.af_products.stock, EXCLUDED.stock),
  active = true,
  featured = EXCLUDED.featured,
  specs = EXCLUDED.specs,
  updated_at = now();
