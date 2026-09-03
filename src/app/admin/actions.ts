"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProduct,
  isAdmin,
  updateOrderStatus,
  upsertProduct,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_HOMEPAGE,
  getHomepageContent,
  setSiteSetting,
  type HomepageContent,
  type PerformanceItem,
  type TestimonialItem,
} from "@/lib/site-settings";

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
  let imageUrl = formData.get("image_url")?.toString() || null;

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) {
      throw new Error("Image must be under 5MB");
    }
    const supabase = await createClient();
    const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${slug || "product"}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, image, {
        cacheControl: "3600",
        upsert: true,
        contentType: image.type || "image/jpeg",
      });
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);
    imageUrl = publicData.publicUrl;
  }

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
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  redirect("/admin/products");
}

export async function updateStockAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const stock = parseInt(formData.get("stock")?.toString() ?? "0", 10);
  if (!id || Number.isNaN(stock) || stock < 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("af_products")
    .update({ stock, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
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

export async function toggleMaintenanceAction(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("enabled") === "true";
  await setSiteSetting("maintenance", { enabled });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/website");
  revalidatePath("/maintenance");
}

export async function savePerformanceAction(formData: FormData) {
  await requireAdmin();
  const current = await getHomepageContent();
  const count = Number(formData.get("count") ?? 0);
  const items: PerformanceItem[] = [];

  for (let i = 0; i < count; i++) {
    items.push({
      title: formData.get(`title_${i}`)?.toString() ?? "",
      desc: formData.get(`desc_${i}`)?.toString() ?? "",
      metric: formData.get(`metric_${i}`)?.toString() ?? "",
      metricLabel: formData.get(`metricLabel_${i}`)?.toString() ?? "",
    });
  }

  const next: HomepageContent = {
    ...current,
    performance: {
      eyebrow: formData.get("eyebrow")?.toString() || DEFAULT_HOMEPAGE.performance.eyebrow,
      title: formData.get("title")?.toString() || DEFAULT_HOMEPAGE.performance.title,
      items: items.length ? items : DEFAULT_HOMEPAGE.performance.items,
    },
  };

  await setSiteSetting("homepage", next);
  revalidatePath("/");
  revalidatePath("/admin/website");
  redirect("/admin/website?saved=performance");
}

export async function saveTestimonialsAction(formData: FormData) {
  await requireAdmin();
  const current = await getHomepageContent();
  const count = Number(formData.get("count") ?? 0);
  const items: TestimonialItem[] = [];

  for (let i = 0; i < count; i++) {
    items.push({
      quote: formData.get(`quote_${i}`)?.toString() ?? "",
      author: formData.get(`author_${i}`)?.toString() ?? "",
      role: formData.get(`role_${i}`)?.toString() ?? "",
      rating: Math.min(5, Math.max(1, Number(formData.get(`rating_${i}`) ?? 5))),
    });
  }

  const next: HomepageContent = {
    ...current,
    testimonials: {
      eyebrow: formData.get("eyebrow")?.toString() || DEFAULT_HOMEPAGE.testimonials.eyebrow,
      title: formData.get("title")?.toString() || DEFAULT_HOMEPAGE.testimonials.title,
      items: items.length ? items : DEFAULT_HOMEPAGE.testimonials.items,
    },
  };

  await setSiteSetting("homepage", next);
  revalidatePath("/");
  revalidatePath("/admin/website");
  redirect("/admin/website?saved=testimonials");
}
