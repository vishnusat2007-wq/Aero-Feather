# Aero Feather

Premium shuttlecock e-commerce store for Ireland — built with Next.js, Supabase, and Stripe.

## Features

- **Public storefront** — branded shop, product pages, cart
- **Customer accounts** — sign up at `/signup`, sign in at `/login`, order history at `/account`
- **Admin dashboard** — manage products, orders, and analytics at `/admin` (owner only)
- **Stripe Checkout** — secure payments with shipping address collection

## Getting started

### 1. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — checkout, webhooks, profile bootstrap |
| `STRIPE_SECRET_KEY` | Stripe secret or restricted key (`rk_live_` / `sk_live_` for production) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (optional for hosted Checkout) |
| `NEXT_PUBLIC_APP_URL` | Apex store URL: `https://aero-feather.vercel.app` (use `http://localhost:3000` locally) |
| `ADMIN_EMAIL` | **Your email** — only this account gets admin access |

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL files in `supabase/migrations/` via the SQL editor (in order). The
   `*_page_views_analytics.sql` migration adds first-party `af_page_views` (RLS:
   anon/authenticated INSERT, admin SELECT). Apply it before expecting the admin
   Analytics page to show live visitor data.
3. In **Authentication → URL configuration**, add:
   - Site URL: `http://localhost:3000` (or your Vercel URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 3. Create your admin account

1. Set `ADMIN_EMAIL=you@yourdomain.com` in `.env.local`
2. Start the app: `npm run dev`
3. Visit `/signup` and register with **that exact email**
4. Sign in — you’ll see an admin link on `/account` and can open `/admin`

Only the `ADMIN_EMAIL` account is promoted to admin. All other signups are customers.

### 4. Deploy on Vercel

1. Push to GitHub and import the repo in Vercel
2. Add all env vars from `.env.example` (use production Stripe keys when ready)
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. Update Supabase redirect URLs to include your production domain

## Auth routes

| Route | Purpose |
|-------|---------|
| `/signup` | Customer registration |
| `/login` | Sign in (customers & admin use the same form) |
| `/login?next=/admin` | Admin sign-in entry |
| `/account` | Profile & order history |
| `/admin` | Store management (admin role only) |

## Stripe Checkout (live)

Single-merchant hosted Checkout. Cart line items use `price_data` in **EUR** from Supabase product prices — Dashboard Price IDs are not required. You can create matching Stripe Products later for reporting.

### Vercel environment (Production)

Set these on the `aero-feather` Vercel project, then redeploy:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)
- `NEXT_PUBLIC_APP_URL` = `https://aero-feather.vercel.app` (apex, not `www`)
- `SUPABASE_SERVICE_ROLE_KEY` (order create / webhook writes)

The checkout API returns **503** with a clear error if `STRIPE_SECRET_KEY` is missing. The app builds without Stripe keys.

### Stripe Dashboard webhook

1. Open the **Aero Feather** account (not another connected account).
2. Developers → Webhooks → Add endpoint.
3. URL (either works; same handler):
   - `https://aero-feather.vercel.app/api/webhooks/stripe`
   - `https://aero-feather.vercel.app/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed` (required)
   - `checkout.session.async_payment_succeeded` (recommended for delayed methods)
5. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Do not use `www.aero-feather.vercel.app` for success/cancel URLs or the webhook endpoint.

## Manual admin promotion (optional)

If you already have an account, run in Supabase SQL:

```sql
UPDATE public.af_profiles SET role = 'admin' WHERE email = 'you@yourdomain.com';
```
