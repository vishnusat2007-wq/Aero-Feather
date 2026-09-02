"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profile";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in");

  const fullName = formData.get("full_name")?.toString().trim() ?? "";
  const phone = formData.get("phone")?.toString().trim() ?? "";

  const { error } = await supabase
    .from("af_profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/account");
}

export async function syncProfileAfterAuth(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId) {
    await ensureUserProfile(user);
  }
}
