import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Degrade gracefully when Supabase isn't configured yet: callers treat a
  // null client as "signed out / unavailable" instead of crashing the page.
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
