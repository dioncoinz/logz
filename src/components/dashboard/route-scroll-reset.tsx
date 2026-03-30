"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search]);

  return null;
}
