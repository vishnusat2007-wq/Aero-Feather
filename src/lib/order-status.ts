import type { OrderStatus } from "@/lib/types";

/** Written when a Stripe Checkout Session starts; payment has not completed. */
export const CHECKOUT_DRAFT_STATUS: OrderStatus = "incomplete";

/** Paid or in the fulfilment pipeline — counts as a real store order. */
export const CONFIRMED_ORDER_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "delivered",
] as const satisfies readonly OrderStatus[];

/** Real store orders, including after-the-fact cancellations and refunds. */
export const STORE_ORDER_STATUSES = [
  ...CONFIRMED_ORDER_STATUSES,
  "cancelled",
  "refunded",
] as const satisfies readonly OrderStatus[];

/**
 * Checkout Session started but payment never completed.
 * Legacy rows used `pending` for this; new rows use `incomplete`.
 */
export const INCOMPLETE_CHECKOUT_STATUSES = [
  "incomplete",
  "pending",
  "abandoned",
] as const satisfies readonly OrderStatus[];

export type ConfirmedOrderStatus = (typeof CONFIRMED_ORDER_STATUSES)[number];
export type StoreOrderStatus = (typeof STORE_ORDER_STATUSES)[number];
export type IncompleteCheckoutStatus = (typeof INCOMPLETE_CHECKOUT_STATUSES)[number];

export function isConfirmedOrderStatus(status: string): status is ConfirmedOrderStatus {
  return (CONFIRMED_ORDER_STATUSES as readonly string[]).includes(status);
}

export function isStoreOrderStatus(status: string): status is StoreOrderStatus {
  return (STORE_ORDER_STATUSES as readonly string[]).includes(status);
}

export function isIncompleteCheckoutStatus(
  status: string,
): status is IncompleteCheckoutStatus {
  return (INCOMPLETE_CHECKOUT_STATUSES as readonly string[]).includes(status);
}

/** Statuses that Stripe can still mark paid (session completed after start/expiry). */
export function isPayableCheckoutStatus(status: string): boolean {
  return isIncompleteCheckoutStatus(status);
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case "incomplete":
    case "pending":
      return "Incomplete checkout";
    case "abandoned":
      return "Abandoned checkout";
    case "paid":
      return "Paid";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}
