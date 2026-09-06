import type Stripe from "stripe";

export const STRIPE_ORDER_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
] as const;

export const STRIPE_ABANDONED_EVENTS = ["checkout.session.expired"] as const;

export type OrderShippingUpdate = {
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_county: string | null;
  shipping_postcode: string | null;
  shipping_country: string;
};

export function isPaidCheckoutEvent(type: string) {
  return (STRIPE_ORDER_EVENTS as readonly string[]).includes(type);
}

export function isExpiredCheckoutEvent(type: string) {
  return (STRIPE_ABANDONED_EVENTS as readonly string[]).includes(type);
}

export function paidCheckoutSessionFromEvent(event: {
  type: string;
  data: { object: Stripe.Checkout.Session };
}): Stripe.Checkout.Session | null {
  if (!isPaidCheckoutEvent(event.type)) {
    return null;
  }

  const session = event.data.object;
  if (!session.id) {
    return null;
  }
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return null;
  }
  return session;
}

export function expiredCheckoutSessionFromEvent(event: {
  type: string;
  data: { object: Stripe.Checkout.Session };
}): Stripe.Checkout.Session | null {
  if (!isExpiredCheckoutEvent(event.type)) {
    return null;
  }

  const session = event.data.object;
  return session.id ? session : null;
}

export function paymentIntentIdFromSession(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }
  return session.payment_intent?.id ?? null;
}

export function shippingFromSession(
  session: Stripe.Checkout.Session,
): OrderShippingUpdate {
  const details = session.collected_information?.shipping_details;
  const address = details?.address;

  return {
    shipping_name: details?.name ?? session.customer_details?.name ?? null,
    shipping_line1: address?.line1 ?? null,
    shipping_line2: address?.line2 ?? null,
    shipping_city: address?.city ?? null,
    shipping_county: address?.state ?? null,
    shipping_postcode: address?.postal_code ?? null,
    shipping_country: address?.country ?? "IE",
  };
}
