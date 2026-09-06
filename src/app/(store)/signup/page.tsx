import { redirect } from "next/navigation";
import { AuthFooterLink, AuthScreen } from "@/components/store/auth-screen";
import { LoginForm } from "@/components/store/login-form";
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
    <AuthScreen
      title="Create account"
      description="Join Aero Feather to track orders and checkout faster"
      footer={
        <>
          <p>
            Already have an account? <AuthFooterLink href="/login">Sign in</AuthFooterLink>
          </p>
          <p className="mt-3">
            <AuthFooterLink href="/">← Back to store</AuthFooterLink>
          </p>
        </>
      }
    >
      <LoginForm mode="signup" next="/account" />
    </AuthScreen>
  );
}
