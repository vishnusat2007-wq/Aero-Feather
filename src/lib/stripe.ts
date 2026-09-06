import Stripe from "stripe";

/**
 * Stripe Node SDK v22: `new Stripe(key)` creates a StripeClient instance.
 * Do not set a module-level `Stripe.apiKey` — that global pattern is deprecated.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
