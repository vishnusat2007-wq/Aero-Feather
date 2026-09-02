import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/format";
import { getCurrentProfile, getUserOrders } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
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
          {profile?.full_name && (
            <p className="text-sm text-af-muted/80">{profile.full_name}</p>
          )}
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      {profile?.role === "admin" && (
        <div className="mb-8 border border-af-cyan/20 bg-af-cyan/5 p-5">
          <p className="text-sm text-af-text">
            You have admin access.{" "}
            <Link href="/admin" className="font-semibold text-af-cyan hover:underline">
              Go to admin dashboard →
            </Link>
          </p>
        </div>
      )}

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
