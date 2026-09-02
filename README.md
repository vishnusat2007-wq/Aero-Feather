# Aero Feather

Premium shuttlecock e-commerce store for Ireland — built with Next.js, Supabase, and Stripe.

## Features

- **Public storefront** — branded shop, product pages, cart, customer login
- **Stripe Checkout** — secure payments with shipping address collection
- **Admin dashboard** — manage products, orders, and order statuses at `/admin`
- **Customer accounts** — sign up, sign in, order history at `/account`

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in your keys:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for checkout & webhooks |
| `STRIPE_SECRET_KEY` | Stripe secret key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` |

3. Run database migrations in Supabase (see `supabase/migrations/`).

4. Promote your admin user in Supabase SQL:

```sql
UPDATE public.af_profiles SET role = 'admin' WHERE email = 'your@email.com';
```

5. Start the dev server:

```bash
npm run dev
```

## Stripe webhook

Point your Stripe webhook to `https://your-domain.com/api/webhooks/stripe` and listen for `checkout.session.completed`.

## Admin access

Sign up as a customer, then run the SQL above to grant admin role. Admins can access `/admin` for product and order management.
