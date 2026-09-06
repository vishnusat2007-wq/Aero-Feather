import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHECKOUT_DRAFT_STATUS,
  formatOrderStatus,
  isConfirmedOrderStatus,
  isIncompleteCheckoutStatus,
  isPayableCheckoutStatus,
  isStoreOrderStatus,
} from "./order-status.ts";

describe("order status classification", () => {
  it("treats paid fulfilment states as confirmed store orders", () => {
    for (const status of ["paid", "processing", "shipped", "delivered"]) {
      assert.equal(isConfirmedOrderStatus(status), true);
      assert.equal(isStoreOrderStatus(status), true);
      assert.equal(isIncompleteCheckoutStatus(status), false);
    }
  });

  it("keeps cancelled and refunded in the store-order list, not dashboard counts", () => {
    assert.equal(isStoreOrderStatus("cancelled"), true);
    assert.equal(isStoreOrderStatus("refunded"), true);
    assert.equal(isConfirmedOrderStatus("cancelled"), false);
    assert.equal(isConfirmedOrderStatus("refunded"), false);
  });

  it("starts Stripe Checkout as an incomplete draft, not a pending store order", () => {
    assert.equal(CHECKOUT_DRAFT_STATUS, "incomplete");
    assert.equal(isIncompleteCheckoutStatus(CHECKOUT_DRAFT_STATUS), true);
    assert.equal(isConfirmedOrderStatus(CHECKOUT_DRAFT_STATUS), false);
  });

  it("classifies checkout drafts and legacy pending rows as incomplete", () => {
    for (const status of ["incomplete", "pending", "abandoned"]) {
      assert.equal(isIncompleteCheckoutStatus(status), true);
      assert.equal(isConfirmedOrderStatus(status), false);
      assert.equal(isStoreOrderStatus(status), false);
      assert.equal(isPayableCheckoutStatus(status), true);
    }
  });

  it("labels incomplete and legacy pending as incomplete checkouts", () => {
    assert.equal(formatOrderStatus("pending"), "Incomplete checkout");
    assert.equal(formatOrderStatus("incomplete"), "Incomplete checkout");
    assert.equal(formatOrderStatus("abandoned"), "Abandoned checkout");
    assert.equal(formatOrderStatus("paid"), "Paid");
  });
});
