import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const items = body.items as CartItem[];
    const email = body.email as string | undefined;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const service = await createServiceClient();
    const productIds = items.map((i) => i.productId);
    const { data: products, error: productsError } = await service
      .from("af_products")
      .select("id, name, slug, price_cents, stock, active")
      .in("id", productIds);

    if (productsError || !products?.length) {
      return NextResponse.json({ error: "Products not found" }, { status: 400 });
    }

    let totalCents = 0;
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.active || product.stock < item.quantity) {
        throw new Error(`Product unavailable: ${item.name}`);
      }
      totalCents += product.price_cents * item.quantity;
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            metadata: { slug: product.slug, product_id: product.id },
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      };
    });

    const { data: order, error: orderError } = await service
      .from("af_orders")
      .insert({
        user_id: user?.id ?? null,
        email: email ?? user?.email ?? "",
        status: "pending",
        total_cents: totalCents,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    await service.from("af_order_items").insert(
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const stripe = getStripe();
    const suffix = Math.random().toString(36).slice(2, 10);
    const freeShipping = totalCents >= 7500;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email ?? user?.email ?? undefined,
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      client_reference_id: order.id,
      metadata: {
        order_id: order.id,
        store: "aero-feather",
        market: "ireland",
      },
      integration_identifier: `aero-feather-checkout-${suffix}`,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["IE", "GB", "FR", "DE", "NL", "BE"],
      },
      shipping_options: [
        freeShipping
          ? {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 0, currency: "eur" },
                display_name: "Free Ireland delivery (orders €75+)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 2 },
                  maximum: { unit: "business_day", value: 4 },
                },
              },
            }
          : {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 495, currency: "eur" },
                display_name: "Standard Ireland / EU delivery",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 2 },
                  maximum: { unit: "business_day", value: 5 },
                },
              },
            },
      ],
      custom_text: {
        shipping_address: {
          message: "We ship tournament-grade shuttlecocks from Ireland. Please include a contact phone for delivery.",
        },
        submit: {
          message: "Aero Feather — premium goose-feather shuttlecocks for Irish badminton.",
        },
      },
      payment_intent_data: {
        description: `Aero Feather order ${order.id}`,
        statement_descriptor_suffix: "AEROFEATHER",
        metadata: { order_id: order.id },
      },
    });

    await service
      .from("af_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
