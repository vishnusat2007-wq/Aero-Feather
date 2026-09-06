import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import {
  paidCheckoutSessionFromEvent,
  paymentIntentIdFromSession,
  shippingFromSession,
} from "./stripe-webhook.ts";

function session(partial: Partial<Stripe.Checkout.Session>): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    object: "checkout.session",
    payment_status: "paid",
    payment_intent: "pi_test_123",
    ...partial,
  } as Stripe.Checkout.Session;
}

describe("paidCheckoutSessionFromEvent", () => {
  it("returns the session for a paid checkout.session.completed event", () => {
    const paid = session({});
    const result = paidCheckoutSessionFromEvent({
      type: "checkout.session.completed",
      data: { object: paid },
    });
    assert.equal(result?.id, "cs_test_123");
  });

  it("accepts async_payment_succeeded", () => {
    const result = paidCheckoutSessionFromEvent({
      type: "checkout.session.async_payment_succeeded",
      data: { object: session({}) },
    });
    assert.ok(result);
  });

  it("ignores unpaid or unrelated events", () => {
    assert.equal(
      paidCheckoutSessionFromEvent({
        type: "checkout.session.completed",
        data: { object: session({ payment_status: "unpaid" }) },
      }),
      null,
    );
    assert.equal(
      paidCheckoutSessionFromEvent({
        type: "payment_intent.succeeded",
        data: { object: session({}) },
      }),
      null,
    );
  });
});

describe("shippingFromSession", () => {
  it("reads collected shipping details from Checkout", () => {
    const shipping = shippingFromSession(
      session({
        collected_information: {
          business_name: null,
          individual_name: null,
          shipping_details: {
            name: "Aoife Byrne",
            address: {
              line1: "12 Main Street",
              line2: "Apt 4",
              city: "Naas",
              state: "Kildare",
              postal_code: "W91 ABC1",
              country: "IE",
            },
          },
        },
      }),
    );

    assert.deepEqual(shipping, {
      shipping_name: "Aoife Byrne",
      shipping_line1: "12 Main Street",
      shipping_line2: "Apt 4",
      shipping_city: "Naas",
      shipping_county: "Kildare",
      shipping_postcode: "W91 ABC1",
      shipping_country: "IE",
    });
  });
});

describe("paymentIntentIdFromSession", () => {
  it("returns a string id or expands an object", () => {
    assert.equal(paymentIntentIdFromSession(session({})), "pi_test_123");
    assert.equal(
      paymentIntentIdFromSession(
        session({ payment_intent: { id: "pi_expanded" } as Stripe.PaymentIntent }),
      ),
      "pi_expanded",
    );
  });
});
