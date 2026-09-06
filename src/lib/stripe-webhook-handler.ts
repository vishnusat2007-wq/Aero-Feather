import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markOrderPaidBySession } from "@/lib/data";
import { getStripeClient, isStripeWebhookConfigured } from "@/lib/stripe";
import {
  paidCheckoutSessionFromEvent,
  paymentIntentIdFromSession,
  shippingFromSession,
} from "@/lib/stripe-webhook";

export async function handleStripeWebhookRequest(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = paidCheckoutSessionFromEvent(
    event as {
      type: string;
      data: { object: Stripe.Checkout.Session };
    },
  );

  if (session) {
    await markOrderPaidBySession(
      session.id,
      paymentIntentIdFromSession(session),
      shippingFromSession(session),
    );
  }

  return NextResponse.json({ received: true });
}
