"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  attribution,
  flush,
  isTrackingDisabled,
  sessionInfo,
  setAttribution,
  track,
} from "@/lib/analytics/client";

// Mounted once in the root layout. Records page views on every route change
// and auto-captures clicks on links and buttons. Business events (product
// view, add to cart, checkout, WhatsApp order) are sent from their components
// via track().

const SITE_HOSTS = ["justfitsng.com", "www.justfitsng.com", "localhost"];

function externalReferrer(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return SITE_HOSTS.some((h) => host === h.replace(/^www\./, "")) ? undefined : host;
  } catch {
    return undefined;
  }
}

function clickLabel(el: HTMLElement): string {
  const explicit = el.getAttribute("data-track") || el.getAttribute("aria-label");
  if (explicit) return explicit;
  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 80);
  const img = el.querySelector("img");
  return img?.getAttribute("alt") || el.getAttribute("title") || el.tagName.toLowerCase();
}

export function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page views (also fires on client-side navigation).
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || isTrackingDisabled()) return;

    const session = sessionInfo();
    if (session.isNew) {
      setAttribution({
        referrer: externalReferrer(),
        utmSource: searchParams.get("utm_source") || undefined,
        utmMedium: searchParams.get("utm_medium") || undefined,
        utmCampaign: searchParams.get("utm_campaign") || undefined,
      });
    }
    track("page_view", { path: pathname, ...attribution() });
  }, [pathname, searchParams]);

  // Click autocapture + flush when the tab is hidden or closed.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/admin")) return;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-track]"
      );
      if (!el || el.closest("[data-track-ignore]")) return;
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || undefined : undefined;
      track("click", { label: clickLabel(el), href });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
