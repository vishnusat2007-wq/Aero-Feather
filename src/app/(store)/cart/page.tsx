import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  let initialEmail = "";
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialEmail = user?.email ?? "";
  }

  return <CartClient initialEmail={initialEmail} />;
}
