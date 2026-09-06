import { NextResponse } from "next/server";
import { parseCollectPayload } from "@/lib/site-analytics";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4_096;

function headerValue(request: Request, name: string): string | null {
  return request.headers.get(name);
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse(null, { status: 204 });
    }

    const raw = await request.text();
    if (!raw || raw.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const event = parseCollectPayload(body, {
      country: headerValue(request, "x-vercel-ip-country"),
      city: headerValue(request, "x-vercel-ip-city"),
      selfHost: headerValue(request, "x-forwarded-host") ?? headerValue(request, "host"),
    });

    if (!event) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createServiceClient();
    await supabase.from("af_page_views").insert(event);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
