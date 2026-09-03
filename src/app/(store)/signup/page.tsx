import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/store/login-form";
import { LogoMark } from "@/components/store/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function SignupPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <LogoMark size={72} glow className="mx-auto" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-af-text">Create account</h1>
        <p className="mt-2 text-sm text-af-muted">
          Join Aero Feather to track orders and checkout faster
        </p>
      </div>
      <div className="rounded-xl border border-af-cyan/15 bg-af-surface p-8 shadow-[0_8px_32px_var(--af-shadow)]">
        <LoginForm defaultMode="signup" next="/account" />
      </div>
      <p className="mt-6 text-center text-sm text-af-muted">
        <Link href="/login" className="text-af-cyan transition-colors hover:text-af-text">
          Already have an account? Sign in
        </Link>
      </p>
    </div>
  );
}
