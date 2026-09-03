import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/store/login-form";
import { LogoMark } from "@/components/store/logo";
import { getCurrentProfile } from "@/lib/data";
import { getMaintenanceEnabled } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/account", error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const maintenance = await getMaintenanceEnabled();
  const isAdminLogin = next.startsWith("/admin") || maintenance;

  if (user && !isAdminLogin) {
    redirect(next.startsWith("/") ? next : "/account");
  }

  if (user && isAdminLogin) {
    const profile = await getCurrentProfile();
    if (profile?.role === "admin") redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <LogoMark size={72} glow className="mx-auto" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-af-text">
          {isAdminLogin ? "Admin login" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-af-muted">
          {maintenance
            ? "Store is in maintenance — admin access only"
            : isAdminLogin
              ? "Store owner access only — use your admin email"
              : "Sign in to track orders and checkout faster"}
        </p>
      </div>
      <div className="rounded-xl border border-af-cyan/15 bg-af-surface p-8 shadow-[0_8px_32px_var(--af-shadow)]">
        <LoginForm next={isAdminLogin ? "/admin" : next} allowSignup={!isAdminLogin} />
      </div>
      {error === "admin_only" && (
        <p className="mt-4 text-center text-sm text-amber-500">
          Admin access is restricted to authorised accounts only.
        </p>
      )}
      {!maintenance && (
        <p className="mt-6 text-center text-sm text-af-muted">
          <Link href="/" className="text-af-cyan transition-colors hover:text-af-text">
            ← Back to store
          </Link>
        </p>
      )}
    </div>
  );
}
