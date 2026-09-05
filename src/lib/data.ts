import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { Order, OrderItem, Product, Profile } from "@/lib/types";

const PRODUCTS = "af_products";
const ORDERS = "af_orders";
const ORDER_ITEMS = "af_order_items";
const PROFILES = "af_profiles";

export async function getActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(PRODUCTS)
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("name");

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(PRODUCTS)
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(PRODUCTS)
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return (data as Product | null) ?? null;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(PRODUCTS)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(PRODUCTS)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Product | null) ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from(PROFILES)
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(ORDERS)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(ORDERS)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(ORDERS)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Order | null) ?? null;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(ORDER_ITEMS)
    .select("*")
    .eq("order_id", orderId);

  if (error) throw error;
  return (data ?? []) as OrderItem[];
}

export async function upsertProduct(
  product: Partial<Product> & { name: string; slug: string; price_cents: number },
) {
  const supabase = await createClient();
  const payload = {
    ...product,
    updated_at: new Date().toISOString(),
  };

  if (product.id) {
    const { data, error } = await supabase
      .from(PRODUCTS)
      .update(payload)
      .eq("id", product.id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  }

  const { data, error } = await supabase
    .from(PRODUCTS)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(PRODUCTS).delete().eq("id", id);
  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(ORDERS)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function markOrderPaidBySession(
  sessionId: string,
  paymentIntentId: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("af_mark_order_paid_by_session", {
    p_session_id: sessionId,
    p_payment_intent_id: paymentIntentId,
  });
  if (error) throw error;
}

export async function getAdminStats() {
  const supabase = await createClient();
  const [products, orders, paidOrders] = await Promise.all([
    supabase.from(PRODUCTS).select("id", { count: "exact", head: true }),
    supabase.from(ORDERS).select("id", { count: "exact", head: true }),
    supabase
      .from(ORDERS)
      .select("total_cents")
      .in("status", ["paid", "processing", "shipped", "delivered"]),
  ]);

  const revenue =
    paidOrders.data?.reduce((sum, o) => sum + (o.total_cents ?? 0), 0) ?? 0;

  return {
    productCount: products.count ?? 0,
    orderCount: orders.count ?? 0,
    revenueCents: revenue,
  };
}
