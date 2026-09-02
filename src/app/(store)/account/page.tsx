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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">My account</h1>
          <p className="mt-1 text-slate-600">{user.email}</p>
          {profile?.full_name && (
            <p className="text-sm text-slate-500">{profile.full_name}</p>
          )}
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      {profile?.role === "admin" && (
        <div className="mb-8 rounded-2xl border border-cyan/30 bg-cyan/5 p-4">
          <p className="text-sm text-navy">
            You have admin access.{" "}
            <Link href="/admin" className="font-semibold text-cyan hover:underline">
              Go to admin dashboard →
            </Link>
          </p>
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold text-navy">Order history</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-slate-500">No orders yet.</p>
          <Button variant="cyan" className="mt-4" asChild>
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div>
                <p className="font-semibold text-navy">{formatPrice(order.total_cents)}</p>
                <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
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
