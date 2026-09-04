"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profile";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function safeInternalPath(value: FormDataEntryValue | null, fallback: string) {
  const raw = value?.toString() ?? "";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}

async function getAppOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export async function authenticateAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Sign-in isn’t available yet — the store owner still needs to finish setup.",
    };
  }

  const mode = formData.get("mode")?.toString() === "signup" ? "signup" : "login";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const fullName = formData.get("fullName")?.toString().trim() ?? "";
  const next = safeInternalPath(formData.get("next"), "/account");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();

  if (mode === "signup") {
    const origin = await getAppOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: origin
          ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
          : undefined,
      },
    });
    if (error) return { error: error.message };

    if (data.session && data.user) {
      try {
        await ensureUserProfile(data.user);
      } catch {
        // Session is already established; profile sync is best-effort.
      }
      revalidatePath("/", "layout");
      redirect(next);
    }

    return {
      message:
        "Account created. Check your email to confirm your address, then sign in.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };
  if (data.user) {
    try {
      await ensureUserProfile(data.user);
    } catch {
      // Session is already established; profile sync is best-effort.
    }
  }

  revalidatePath("/", "layout");
  redirect(next);
}

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

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in");

  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm_password")?.toString() ?? "";

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (password !== confirm) {
    throw new Error("Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
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
