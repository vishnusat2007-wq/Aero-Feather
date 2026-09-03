import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/admin"] as const;

const MAINTENANCE_ALLOW = [
  "/maintenance",
  "/login",
  "/auth",
  "/api/auth",
  "/api/webhooks",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  let isAdminUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("af_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdminUser = profile?.role === "admin";
  }

  if (pathname.startsWith("/admin") && user && !isAdminUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.searchParams.set("error", "admin_only");
    return NextResponse.redirect(url);
  }

  const allowedDuringMaintenance = MAINTENANCE_ALLOW.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isAdminUser) {
    const { data: maintenanceRow } = await supabase
      .from("af_site_settings")
      .select("value")
      .eq("key", "maintenance")
      .maybeSingle();

    const maintenanceOn = Boolean(
      (maintenanceRow?.value as { enabled?: boolean } | null)?.enabled,
    );

    if (maintenanceOn) {
      // Block signup entirely; login only for admin entry
      if (pathname.startsWith("/signup")) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        url.search = "";
        return NextResponse.redirect(url);
      }

      if (!allowedDuringMaintenance && !pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
