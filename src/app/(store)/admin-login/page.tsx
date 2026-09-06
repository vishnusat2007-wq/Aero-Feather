import { redirect } from "next/navigation";
import { AuthFooterLink, AuthScreen } from "@/components/store/auth-screen";
import { LoginForm } from "@/components/store/login-form";
import { getCurrentProfile } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user: signedInUser },
    } = await supabase.auth.getUser();
    user = signedInUser;
  }
  const profile = user ? await getCurrentProfile() : null;

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <AuthScreen
      title="Admin login"
      description="Store owner access — sign in with your admin email to open the dashboard."
      footer={
        <p>
          <AuthFooterLink href="/">← Back to store</AuthFooterLink>
        </p>
      }
    >
      <LoginForm next="/admin" mode="login" />
    </AuthScreen>
  );
}
