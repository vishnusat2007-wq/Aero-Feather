import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await ensureUserProfile(data.user);
      if (next === "/admin") {
        const { data: profile } = await supabase
          .from("af_profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role !== "admin") next = "/account";
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
