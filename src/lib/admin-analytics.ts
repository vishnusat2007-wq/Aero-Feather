import { createClient } from "@/lib/supabase/server";
import type { Order, Product } from "@/lib/types";
import { getAllOrders, getAllProducts } from "@/lib/data";

export type MonthBucket = {
  key: string;
  label: string;
  revenueCents: number;
  orderCount: number;
};

export type StatusBucket = {
  status: string;
  count: number;
  revenueCents: number;
};

export type FinanceSnapshot = {
  totalRevenueCents: number;
  paidOrderCount: number;
  averageOrderCents: number;
  pendingCount: number;
  monthly: MonthBucket[];
  byStatus: StatusBucket[];
  recentPaid: Order[];
};

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-IE", { month: "short", year: "2-digit" });
}

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const orders = await getAllOrders();
  const now = new Date();
  const monthly: MonthBucket[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly.push({
      key: monthKey(d),
      label: monthLabel(d),
      revenueCents: 0,
      orderCount: 0,
    });
  }

  const monthMap = new Map(monthly.map((m) => [m.key, m]));
  const statusMap = new Map<string, StatusBucket>();

  let totalRevenueCents = 0;
  let paidOrderCount = 0;
  let pendingCount = 0;

  for (const order of orders) {
    const status = order.status;
    const bucket = statusMap.get(status) ?? {
      status,
      count: 0,
      revenueCents: 0,
    };
    bucket.count += 1;
    bucket.revenueCents += order.total_cents;
    statusMap.set(status, bucket);

    if (status === "pending") pendingCount += 1;

    if (PAID_STATUSES.has(status)) {
      totalRevenueCents += order.total_cents;
      paidOrderCount += 1;
      const key = monthKey(new Date(order.created_at));
      const m = monthMap.get(key);
      if (m) {
        m.revenueCents += order.total_cents;
        m.orderCount += 1;
      }
    }
  }

  const recentPaid = orders
    .filter((o) => PAID_STATUSES.has(o.status))
    .slice(0, 8);

  return {
    totalRevenueCents,
    paidOrderCount,
    averageOrderCents:
      paidOrderCount > 0 ? Math.round(totalRevenueCents / paidOrderCount) : 0,
    pendingCount,
    monthly,
    byStatus: Array.from(statusMap.values()).sort((a, b) => b.count - a.count),
    recentPaid,
  };
}

export type InventoryRow = Product & {
  valueCents: number;
  status: "ok" | "low" | "out";
};

export type InventorySnapshot = {
  rows: InventoryRow[];
  totalUnits: number;
  totalValueCents: number;
  lowStockCount: number;
  outOfStockCount: number;
  skuCount: number;
};

const LOW_STOCK = 40;

export async function getInventorySnapshot(): Promise<InventorySnapshot> {
  const products = await getAllProducts();
  const rows: InventoryRow[] = products.map((p) => ({
    ...p,
    valueCents: p.stock * p.price_cents,
    status: p.stock <= 0 ? "out" : p.stock < LOW_STOCK ? "low" : "ok",
  }));

  return {
    rows: rows.sort((a, b) => a.stock - b.stock),
    totalUnits: rows.reduce((s, r) => s + r.stock, 0),
    totalValueCents: rows.reduce((s, r) => s + r.valueCents, 0),
    lowStockCount: rows.filter((r) => r.status === "low").length,
    outOfStockCount: rows.filter((r) => r.status === "out").length,
    skuCount: rows.length,
  };
}

export async function getOrderItemsSoldByProduct() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("af_order_items")
    .select("product_id, product_name, quantity, unit_price_cents");
  return data ?? [];
}
