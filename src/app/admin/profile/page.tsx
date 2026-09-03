import { ChangePasswordForm } from "@/components/store/change-password-form";
import { updateProfileAction } from "@/lib/auth/actions";
import { getCurrentProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/profile");

  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-af-cyan uppercase">
          Settings
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-slate-400">{user.email}</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Account details</h2>
        <form action={updateProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your name"
              className="border-white/10 bg-[#060b18] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              placeholder="+353 …"
              className="border-white/10 bg-[#060b18] text-white"
            />
          </div>
          <Button type="submit" variant="cyan" size="sm">
            Save profile
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1a34] p-6">
        <h2 className="mb-2 text-lg font-bold text-white">Password</h2>
        <p className="mb-4 text-sm text-slate-400">
          Change your admin sign-in password. Use at least 6 characters.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
