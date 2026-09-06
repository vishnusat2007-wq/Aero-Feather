import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LIVE_APP_ORIGIN,
  LOCAL_APP_ORIGIN,
  buildCheckoutLineItems,
  buildCheckoutSessionParams,
  normalizeCheckoutEmail,
  resolveAppUrl,
} from "./checkout.ts";
import type { CartItem } from "./types.ts";

const product = {
  id: "prod_1",
  name: "Tournament Goose",
  slug: "tournament-goose",
  price_cents: 2499,
  stock: 10,
  active: true,
};

const item: CartItem = {
  productId: "prod_1",
  slug: "tournament-goose",
  name: "Tournament Goose",
  priceCents: 2499,
  imageUrl: null,
  quantity: 2,
};

describe("resolveAppUrl", () => {
  it("defaults to the live apex domain outside development", () => {
    assert.equal(resolveAppUrl("", "production"), LIVE_APP_ORIGIN);
  });

  it("defaults to localhost in development", () => {
    assert.equal(resolveAppUrl("", "development"), LOCAL_APP_ORIGIN);
  });

  it("rewrites www Vercel host to the apex domain", () => {
    assert.equal(
      resolveAppUrl("https://www.aero-feather.vercel.app/", "production"),
      LIVE_APP_ORIGIN,
    );
  });

  it("strips a trailing slash from a configured URL", () => {
    assert.equal(
      resolveAppUrl("https://aero-feather.vercel.app/", "production"),
      LIVE_APP_ORIGIN,
    );
  });
});

describe("normalizeCheckoutEmail", () => {
  it("prefers the submitted email and lowercases it", () => {
    assert.equal(
      normalizeCheckoutEmail("  Customer@Aero.ie ", "other@aero.ie"),
      "customer@aero.ie",
    );
  });

  it("falls back to the signed-in user email", () => {
    assert.equal(normalizeCheckoutEmail("", "Owner@Aero.ie"), "owner@aero.ie");
  });

  it("rejects missing or invalid addresses", () => {
    assert.equal(normalizeCheckoutEmail("not-an-email", null), null);
    assert.equal(normalizeCheckoutEmail("", ""), null);
  });
});

describe("buildCheckoutLineItems", () => {
  it("builds EUR price_data from catalogue amounts", () => {
    const { lineItems, totalCents } = buildCheckoutLineItems([item], [product]);
    assert.equal(totalCents, 4998);
    assert.deepEqual(lineItems[0], {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Tournament Goose",
          metadata: { slug: "tournament-goose", product_id: "prod_1" },
        },
        unit_amount: 2499,
      },
      quantity: 2,
    });
  });

  it("rejects unavailable or out-of-stock products", () => {
    assert.throws(
      () => buildCheckoutLineItems([item], [{ ...product, stock: 1 }]),
      /Product unavailable/,
    );
  });

  it("rejects an empty cart", () => {
    assert.throws(() => buildCheckoutLineItems([], [product]), /Cart is empty/);
  });
});

describe("buildCheckoutSessionParams", () => {
  it("creates a hosted session without payment_method_types", () => {
    const { lineItems } = buildCheckoutLineItems([item], [product]);
    const params = buildCheckoutSessionParams({
      lineItems,
      email: "buyer@aero.ie",
      orderId: "order_1",
      appUrl: LIVE_APP_ORIGIN,
      suffix: "abcd1234",
    });

    assert.equal(params.mode, "payment");
    assert.equal(params.customer_email, "buyer@aero.ie");
    assert.equal(
      params.success_url,
      `${LIVE_APP_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    );
    assert.equal(params.cancel_url, `${LIVE_APP_ORIGIN}/cart`);
    assert.equal(params.integration_identifier, "aero-feather-abcd1234");
    assert.deepEqual(params.shipping_address_collection?.allowed_countries, [
      "IE",
      "GB",
      "FR",
      "DE",
      "NL",
      "BE",
    ]);
    assert.equal("payment_method_types" in params, false);
  });
});
