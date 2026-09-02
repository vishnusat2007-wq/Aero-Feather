import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfileAction } from "@/lib/auth/actions";
import { formatDate, formatPrice } from "@/lib/format";
import { getCurrentProfile, getUserOrders } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const profile = await getCurrentProfile();
  const orders = await getUserOrders(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-af-cyan uppercase">
            Account
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-af-text">My account</h1>
          <p className="mt-1 text-af-muted">{user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      {error === "admin_only" && (
        <div className="mb-8 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-af-text">
          Admin dashboard access is limited to the store owner account. Customer accounts
          cannot open the admin panel.
        </div>
      )}

      {profile?.role === "admin" && (
        <div className="mb-8 border border-af-cyan/20 bg-af-cyan/5 p-5">
          <p className="text-sm text-af-text">
            You have admin access.{" "}
            <Link href="/admin" className="font-semibold text-af-cyan hover:underline">
              Open admin dashboard →
            </Link>
          </p>
        </div>
      )}

      <section className="mb-12 border border-af-cyan/10 bg-af-surface p-6">
        <h2 className="mb-4 text-lg font-bold text-af-text">Profile</h2>
        <form action={updateProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              placeholder="+353 …"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Save profile
          </Button>
        </form>
      </section>

      <h2 className="mb-5 text-xl font-bold text-af-text">Order history</h2>
      {orders.length === 0 ? (
        <div className="border border-dashed border-af-cyan/20 p-10 text-center">
          <p className="text-af-muted">No orders yet.</p>
          <Button variant="primary" className="mt-5" asChild>
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border border-af-cyan/10 bg-af-surface p-5"
            >
              <div>
                <p className="font-semibold text-af-text">{formatPrice(order.total_cents)}</p>
                <p className="text-sm text-af-muted">{formatDate(order.created_at)}</p>
              </div>
              <Badge variant={order.status === "paid" ? "cyan" : "outline"}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
