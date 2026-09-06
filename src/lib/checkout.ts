import type Stripe from "stripe";
import type { CartItem } from "@/lib/types";

export const LIVE_APP_ORIGIN = "https://aero-feather.vercel.app";
export const LOCAL_APP_ORIGIN = "http://localhost:3000";
export const CHECKOUT_CURRENCY = "eur";

export const SHIPPING_COUNTRIES = ["IE", "GB", "FR", "DE", "NL", "BE"] as const;

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  stock: number;
  active: boolean;
};

export type CheckoutLineItem = Stripe.Checkout.SessionCreateParams.LineItem;

export function resolveAppUrl(
  envUrl = process.env.NEXT_PUBLIC_APP_URL,
  nodeEnv = process.env.NODE_ENV,
) {
  let url = (envUrl ?? "").trim().replace(/\/$/, "");
  if (!url) {
    url = nodeEnv === "development" ? LOCAL_APP_ORIGIN : LIVE_APP_ORIGIN;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "www.aero-feather.vercel.app") {
      return LIVE_APP_ORIGIN;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return nodeEnv === "development" ? LOCAL_APP_ORIGIN : LIVE_APP_ORIGIN;
  }
}

export function normalizeCheckoutEmail(
  raw?: string | null,
  userEmail?: string | null,
) {
  const candidate = (raw?.trim() || userEmail?.trim() || "").toLowerCase();
  if (!candidate.includes("@") || candidate.length < 3) {
    return null;
  }
  return candidate;
}

export function buildCheckoutLineItems(
  items: CartItem[],
  products: CatalogProduct[],
) {
  if (!items.length) {
    throw new Error("Cart is empty");
  }

  let totalCents = 0;
  const lineItems: CheckoutLineItem[] = items.map((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity for ${item.name}`);
    }

    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.active || product.stock < item.quantity) {
      throw new Error(`Product unavailable: ${item.name}`);
    }

    totalCents += product.price_cents * item.quantity;
    return {
      price_data: {
        currency: CHECKOUT_CURRENCY,
        product_data: {
          name: product.name,
          metadata: {
            slug: product.slug,
            product_id: product.id,
          },
        },
        unit_amount: product.price_cents,
      },
      quantity: item.quantity,
    };
  });

  return { lineItems, totalCents };
}

export function randomIntegrationSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

export function buildCheckoutSessionParams(input: {
  lineItems: CheckoutLineItem[];
  email: string;
  orderId: string;
  appUrl: string;
  suffix?: string;
}): Stripe.Checkout.SessionCreateParams {
  const appUrl = input.appUrl.replace(/\/$/, "");
  const suffix = input.suffix ?? randomIntegrationSuffix();

  return {
    mode: "payment",
    customer_email: input.email,
    line_items: input.lineItems,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart`,
    client_reference_id: input.orderId,
    metadata: {
      order_id: input.orderId,
      store: "aero-feather",
    },
    integration_identifier: `aero-feather-${suffix}`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_COUNTRIES],
    },
  };
}
