"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendAnalyticsEvent } from "@/lib/analytics-client";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    sendAnalyticsEvent({
      path: pathname,
      search: searchParams.toString() ? `?${searchParams.toString()}` : "",
    });
  }, [pathname, searchParams]);

  return null;
}
