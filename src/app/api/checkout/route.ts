import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import {
  buildCheckoutLineItems,
  buildCheckoutSessionParams,
  normalizeCheckoutEmail,
  resolveAppUrl,
} from "@/lib/checkout";
import { CHECKOUT_DRAFT_STATUS } from "@/lib/order-status";
import type { CartItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to the Vercel environment.",
        },
        { status: 503 },
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase service role is not configured. Add SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const items = body.items as CartItem[];
    const requestedEmail =
      typeof body.email === "string" ? body.email : undefined;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = normalizeCheckoutEmail(requestedEmail, user?.email);
    if (!email) {
      return NextResponse.json(
        { error: "A valid email is required for Stripe Checkout." },
        { status: 400 },
      );
    }

    const service = await createServiceClient();
    const productIds = [...new Set(items.map((item) => item.productId))];
    const { data: products, error: productsError } = await service
      .from("af_products")
      .select("id, name, slug, price_cents, stock, active")
      .in("id", productIds);

    if (productsError || !products?.length) {
      return NextResponse.json({ error: "Products not found" }, { status: 400 });
    }

    let lineItems;
    let totalCents;
    try {
      ({ lineItems, totalCents } = buildCheckoutLineItems(items, products));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cart is invalid";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data: order, error: orderError } = await service
      .from("af_orders")
      .insert({
        user_id: user?.id ?? null,
        email,
        status: CHECKOUT_DRAFT_STATUS,
        total_cents: totalCents,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    const { error: itemsError } = await service.from("af_order_items").insert(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          quantity: item.quantity,
          unit_price_cents: product.price_cents,
        };
      }),
    );

    if (itemsError) {
      return NextResponse.json({ error: "Could not create order items" }, { status: 500 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams({
        lineItems,
        email,
        orderId: order.id,
        appUrl: resolveAppUrl(),
      }),
    );

    const { error: attachError } = await service
      .from("af_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    if (attachError || !session.url) {
      return NextResponse.json(
        { error: "Could not start Stripe Checkout" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
