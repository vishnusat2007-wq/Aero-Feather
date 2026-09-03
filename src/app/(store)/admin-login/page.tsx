import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/store/login-form";
import { LogoMark } from "@/components/store/logo";
import { getCurrentProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getCurrentProfile() : null;

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <LogoMark size={72} glow className="mx-auto" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-af-text">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-af-muted">
          Store owner access — sign in with your admin email to open the dashboard.
        </p>
      </div>
      <div className="rounded-xl border border-af-cyan/15 bg-af-surface p-8 shadow-[0_8px_32px_var(--af-shadow)]">
        <LoginForm next="/admin" allowSignup={false} />
      </div>
      <p className="mt-6 text-center text-sm text-af-muted">
        <Link href="/" className="text-af-cyan transition-colors hover:text-af-text">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
