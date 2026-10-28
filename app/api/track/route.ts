import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { EVENT_TYPES, type TrackPayload } from "@/lib/analytics/events";

// POST /api/track - public, first-party analytics ingest.
// The site tracker batches events and sends them with navigator.sendBeacon.
// Anonymous by design: random visitor/session ids, no cookies, and no IP
// address is stored (only Vercel's coarse country/city).
export const dynamic = "force-dynamic";

const MAX_EVENTS = 25;
const ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;

const cut = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

function parseUA(ua: string) {
  const device = /ipad|tablet/i.test(ua)
    ? "tablet"
    : /mobi|iphone|android/i.test(ua)
      ? "mobile"
      : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /chrome|crios/i.test(ua)
          ? "Chrome"
          : /firefox|fxios/i.test(ua)
            ? "Firefox"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";
  const os = /android/i.test(ua)
    ? "Android"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /windows/i.test(ua)
        ? "Windows"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

const decode = (v: string | null) => {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (!ua || BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

    // sendBeacon posts text/plain; parse the raw body as JSON either way.
    const raw = await request.text();
    if (raw.length > 50_000) return new NextResponse(null, { status: 413 });
    const body = JSON.parse(raw) as TrackPayload;

    if (!ID_RE.test(body?.visitorId || "") || !ID_RE.test(body?.sessionId || "")) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }
    const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];

    const { device, browser, os } = parseUA(ua);
    const country = request.headers.get("x-vercel-ip-country");
    const city = decode(request.headers.get("x-vercel-ip-city"));

    const rows = events
      .filter((e) => EVENT_TYPES.includes(e?.type) && typeof e.path === "string")
      .filter((e) => !e.path.startsWith("/admin") && !e.path.startsWith("/api"))
      .map((e) => {
        const value = Number(e.value);
        return {
          type: e.type,
          path: e.path.slice(0, 300),
          visitorId: body.visitorId,
          sessionId: body.sessionId,
          referrer: cut(e.referrer, 200),
          utmSource: cut(e.utmSource, 100),
          utmMedium: cut(e.utmMedium, 100),
          utmCampaign: cut(e.utmCampaign, 100),
          label: cut(e.label, 120),
          href: cut(e.href, 500),
          productSlug: cut(e.productSlug, 200),
          value: Number.isFinite(value) && value >= 0 && value < 1e10 ? value : null,
          country: cut(country, 4),
          city: cut(city, 80),
          device,
          browser,
          os,
        };
      });

    if (rows.length) await prisma.analyticsEvent.createMany({ data: rows });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Track error:", error);
    return new NextResponse(null, { status: 204 }); // never break the site
  }
}
