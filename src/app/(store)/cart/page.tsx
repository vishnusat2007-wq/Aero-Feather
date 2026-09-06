import { getSignedInEmail } from "@/lib/supabase/server";
import { CartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  return <CartClient initialEmail={await getSignedInEmail()} />;
}
