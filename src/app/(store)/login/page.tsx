import { redirect } from "next/navigation";
import { AuthFooterLink, AuthScreen } from "@/components/store/auth-screen";
import { LoginForm } from "@/components/store/login-form";
import { getCurrentProfile } from "@/lib/data";
import { getMaintenanceEnabled } from "@/lib/site-settings";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/account", error } = await searchParams;
  const maintenance = await getMaintenanceEnabled();
  const isAdminLogin = next.startsWith("/admin") || maintenance;

  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user: signedInUser },
    } = await supabase.auth.getUser();
    user = signedInUser;
  }

  if (user && !isAdminLogin) {
    redirect(next.startsWith("/") ? next : "/account");
  }

  if (user && isAdminLogin) {
    const profile = await getCurrentProfile();
    if (profile?.role === "admin") redirect("/admin");
  }

  return (
    <AuthScreen
      title={isAdminLogin ? "Admin login" : "Sign in"}
      description={
        maintenance
          ? "Store is in maintenance — admin access only"
          : isAdminLogin
            ? "Store owner access only — use your admin email"
            : "Sign in to track orders and checkout faster"
      }
      footer={
        <>
          {error === "admin_only" && (
            <p className="mb-4 text-amber-500">
              Admin access is restricted to authorised accounts only.
            </p>
          )}
          {!isAdminLogin && (
            <p>
              New here? <AuthFooterLink href="/signup">Create an account</AuthFooterLink>
            </p>
          )}
          {!maintenance && (
            <p className={isAdminLogin ? "" : "mt-3"}>
              <AuthFooterLink href="/">← Back to store</AuthFooterLink>
            </p>
          )}
        </>
      }
    >
      <LoginForm next={isAdminLogin ? "/admin" : next} mode="login" />
    </AuthScreen>
  );
}
