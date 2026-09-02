"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProduct,
  isAdmin,
  updateOrderStatus,
  upsertProduct,
} from "@/lib/data";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() ?? "";
  const slug = formData.get("slug")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";
  const priceEuros = parseFloat(formData.get("price")?.toString() ?? "0");
  const compareEuros = formData.get("compare_at")?.toString();
  const category = formData.get("category")?.toString() ?? "shuttlecocks";
  const stock = parseInt(formData.get("stock")?.toString() ?? "0", 10);
  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";
  const imageUrl = formData.get("image_url")?.toString() || null;

  await upsertProduct({
    ...(id ? { id } : {}),
    name,
    slug,
    description,
    price_cents: Math.round(priceEuros * 100),
    compare_at_cents: compareEuros
      ? Math.round(parseFloat(compareEuros) * 100)
      : null,
    category,
    stock,
    active,
    featured,
    image_url: imageUrl,
    specs: {},
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  if (!id || !status) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
