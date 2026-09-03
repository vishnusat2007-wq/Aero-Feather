# Aero Feather

Premium shuttlecock e-commerce store for Ireland — built with Next.js, Supabase, and Stripe.

## Features

- **Public storefront** — branded shop, product pages, cart
- **Customer accounts** — sign up at `/signup`, sign in at `/login`, order history at `/account`
- **Admin dashboard** — manage products & orders at `/admin` (owner only)
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
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` |
| `ADMIN_EMAIL` | **Your email** — only this account gets admin access |

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run both migrations in `supabase/migrations/` via the SQL editor (in order)
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

## Stripe webhook

Point Stripe to `https://your-domain.com/api/webhooks/stripe` for `checkout.session.completed`.

## Manual admin promotion (optional)

If you already have an account, run in Supabase SQL:

```sql
UPDATE public.af_profiles SET role = 'admin' WHERE email = 'you@yourdomain.com';
```
