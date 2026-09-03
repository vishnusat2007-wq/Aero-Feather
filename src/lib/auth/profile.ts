import { createServiceClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();

/** Create/update profile after signup or OAuth; promote ADMIN_EMAIL to admin role */
export async function ensureUserProfile(user: User) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const supabase = await createServiceClient();
  const email = user.email?.toLowerCase() ?? null;
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  const { data: existing } = await supabase
    .from("af_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    existing?.role === "admin"
      ? "admin"
      : email && ADMIN_EMAIL && email === ADMIN_EMAIL
        ? "admin"
        : "customer";

  await supabase.from("af_profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export function isConfiguredAdminEmail(email: string | undefined | null): boolean {
  if (!ADMIN_EMAIL || !email) return false;
  return email.toLowerCase() === ADMIN_EMAIL;
}
