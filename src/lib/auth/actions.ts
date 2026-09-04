"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  validateNewPassword,
  type PasswordFormState,
} from "@/lib/auth/password";

export type { PasswordFormState } from "@/lib/auth/password";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in");

  const fullName = formData.get("full_name")?.toString().trim() ?? "";
  const phoneRaw = formData.get("phone");
  const hasPhoneField = phoneRaw !== null;

  const updates: {
    full_name: string | null;
    updated_at: string;
    phone?: string | null;
  } = {
    full_name: fullName || null,
    updated_at: new Date().toISOString(),
  };

  if (hasPhoneField) {
    const phone = phoneRaw.toString().trim();
    updates.phone = phone || null;
  }

  const { error } = await supabase
    .from("af_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/account");
  revalidatePath("/admin/profile");
}

export async function updatePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not signed in" };

    const password = formData.get("password")?.toString() ?? "";
    const confirm = formData.get("confirm_password")?.toString() ?? "";
    const invalid = validateNewPassword(password, confirm);
    if (invalid) return { error: invalid };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };

    return { success: true };
  } catch {
    // Never throw — production sanitizes Server Action throws as React #441.
    return { error: "Could not update password" };
  }
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
