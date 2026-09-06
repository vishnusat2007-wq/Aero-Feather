import { handleStripeWebhookRequest } from "@/lib/stripe-webhook-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleStripeWebhookRequest(request);
}
