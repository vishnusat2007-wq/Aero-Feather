# Connect Aero Feather Stripe (live account)

The MCP session is authorized for **Aero Feather** (`acct_1UCO3SIAW6C0UScO`) in **live** mode.
OAuth scopes here can read the account, but cannot create webhooks or reveal secret keys.
Add these in the Stripe Dashboard, then paste into Vercel.

## 1. Secret key (Aero Feather)

1. Open [Aero Feather API keys](https://dashboard.stripe.com/acct_1UCO3SIAW6C0UScO/apikeys)
2. Create a **restricted key** with permission to:
   - Checkout Sessions: Write
   - Customers: Write
   - Payment Intents: Write
   - Webhook Endpoints: Read (optional)
3. Copy the `rk_live_…` (or `sk_live_…`) value

## 2. Webhook

1. Open [Aero Feather webhooks](https://dashboard.stripe.com/acct_1UCO3SIAW6C0UScO/workbench/webhooks)
2. Add destination → Webhook endpoint
3. URL: `https://aero-feather.vercel.app/api/webhooks/stripe`
4. Event: `checkout.session.completed`
5. Reveal and copy the signing secret (`whsec_…`)

## 3. Vercel env (Production + Preview)

| Name | Value |
|------|--------|
| `STRIPE_SECRET_KEY` | from step 1 |
| `STRIPE_WEBHOOK_SECRET` | from step 2 |
| `NEXT_PUBLIC_APP_URL` | `https://aero-feather.vercel.app` |

Redeploy after saving.

If you want the agent to create webhooks automatically next time, re-authorize with write scopes via the Stripe MCP connect flow in Cursor.


## 4. Re-authorize Stripe MCP (optional, for agents)

If Cursor still cannot create webhooks for **Aero Feather**, reconnect Stripe MCP with write scopes:

1. Open the Stripe MCP account manager in Cursor
2. Prefer **Aero Feather** (`acct_1UCO3SIAW6C0UScO`) over PBC Kildare
3. Grant Checkout Sessions + Webhook Endpoints write

Until then, create the live restricted key + webhook signing secret in the Dashboard (steps 1–2) and paste them into Vercel (step 3).

## 5. Local test sandbox

For local Buy Now testing without live charges, you can use a claimable Stripe sandbox `rkcs_test_…` key in `.env.local` as `STRIPE_SECRET_KEY`. Production must use the Aero Feather **live** key.
