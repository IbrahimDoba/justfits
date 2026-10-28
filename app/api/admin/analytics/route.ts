import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/analytics?range=today|7d|30d|90d
// Aggregates first-party site events for the admin Analytics page.
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const LAGOS_OFFSET = 60 * 60 * 1000; // WAT, UTC+1, no DST
const RANGES: Record<string, number> = { today: 1, "7d": 7, "30d": 30, "90d": 90 };

// Start of the Lagos calendar day containing `d`, as a UTC instant.
const lagosDayStart = (d: number) =>
  Math.floor((d + LAGOS_OFFSET) / DAY) * DAY - LAGOS_OFFSET;

// Friendly names for common referrer domains.
function sourceName(raw: string): string {
  const s = raw.toLowerCase();
  if (s === "direct") return "Direct";
  if (s.includes("instagram")) return "Instagram";
  if (s.includes("facebook") || s === "fb.me" || s.includes("fb.com")) return "Facebook";
  if (s.includes("whatsapp") || s === "wa.me") return "WhatsApp";
  if (s.includes("google")) return "Google";
  if (s === "t.co" || s.includes("twitter") || s === "x.com") return "X (Twitter)";
  if (s.includes("tiktok")) return "TikTok";
  if (s.includes("snapchat")) return "Snapchat";
  if (s.includes("bing")) return "Bing";
  return raw;
}

type Row = Record<string, unknown>;
const n = (v: unknown) => Number(v ?? 0);

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rangeKey = request.nextUrl.searchParams.get("range") || "7d";
    const days = RANGES[rangeKey] ?? 7;
    const now = Date.now();
    const startMs = lagosDayStart(now - (days - 1) * DAY);
    const start = new Date(startMs);
    const end = new Date(now);
    const prevStart = new Date(startMs - (now - startMs));
    const unit = rangeKey === "today" ? "hour" : "day";

    const inRange = (from: Date, to: Date) =>
      Prisma.sql`"createdAt" >= ${from} AND "createdAt" < ${to}`;
    const cur = inRange(start, end);

    const totalsSql = (where: Prisma.Sql) => prisma.$queryRaw<Row[]>`
      SELECT count(DISTINCT "visitorId") AS visitors,
             count(DISTINCT "sessionId") AS sessions,
             count(*) FILTER (WHERE type = 'page_view') AS "pageViews",
             count(*) FILTER (WHERE type = 'product_view') AS "productViews",
             count(*) FILTER (WHERE type = 'add_to_cart') AS "addToCart",
             count(*) FILTER (WHERE type = 'checkout_start') AS "checkouts",
             count(*) FILTER (WHERE type = 'whatsapp_order') AS "whatsappOrders",
             coalesce(sum(value) FILTER (WHERE type = 'whatsapp_order'), 0) AS "orderValue",
             count(*) FILTER (WHERE type = 'click') AS clicks,
             count(*) FILTER (WHERE type = 'click' AND href ILIKE '%wa.me%') AS "whatsappClicks"
      FROM analytics_events WHERE ${where}`;

    const [
      totals,
      prevTotals,
      bounce,
      series,
      live,
      topPages,
      topProducts,
      topClicks,
      sources,
      countries,
      cities,
      devices,
      browsers,
      funnel,
      recent,
    ] = await Promise.all([
      totalsSql(cur),
      totalsSql(inRange(prevStart, start)),
      prisma.$queryRaw<Row[]>`
        SELECT count(*) AS total, count(*) FILTER (WHERE pv <= 1) AS bounced
        FROM (SELECT "sessionId", count(*) FILTER (WHERE type = 'page_view') AS pv
              FROM analytics_events WHERE ${cur} GROUP BY 1) s`,
      prisma.$queryRaw<Row[]>`
        SELECT to_char(date_trunc(${unit}, "createdAt" + interval '1 hour'),
                       'YYYY-MM-DD"T"HH24:00:00"Z"') AS bucket,
               count(DISTINCT "visitorId") AS visitors,
               count(*) FILTER (WHERE type = 'page_view') AS "pageViews",
               count(*) FILTER (WHERE type = 'whatsapp_order') AS orders
        FROM analytics_events WHERE ${cur} GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<Row[]>`
        SELECT count(DISTINCT "visitorId") AS visitors FROM analytics_events
        WHERE "createdAt" >= ${new Date(now - 5 * 60 * 1000)}`,
      prisma.$queryRaw<Row[]>`
        SELECT path, count(*) AS views, count(DISTINCT "visitorId") AS visitors
        FROM analytics_events WHERE ${cur} AND type = 'page_view'
        GROUP BY path ORDER BY views DESC LIMIT 10`,
      prisma.$queryRaw<Row[]>`
        SELECT "productSlug" AS slug,
               coalesce(max(label) FILTER (WHERE type = 'product_view'), max(label)) AS name,
               count(*) FILTER (WHERE type = 'product_view') AS views,
               count(DISTINCT "visitorId") FILTER (WHERE type = 'product_view') AS viewers,
               count(*) FILTER (WHERE type = 'add_to_cart') AS carts
        FROM analytics_events WHERE ${cur} AND "productSlug" IS NOT NULL
        GROUP BY 1 ORDER BY views DESC, carts DESC LIMIT 10`,
      prisma.$queryRaw<Row[]>`
        SELECT label, max(href) AS href, count(*) AS clicks
        FROM analytics_events WHERE ${cur} AND type = 'click' AND label IS NOT NULL
        GROUP BY label ORDER BY clicks DESC LIMIT 15`,
      prisma.$queryRaw<Row[]>`
        SELECT coalesce(nullif("utmSource", ''), referrer, 'direct') AS source,
               count(DISTINCT "sessionId") AS sessions
        FROM analytics_events WHERE ${cur} AND type = 'page_view'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 25`,
      prisma.$queryRaw<Row[]>`
        SELECT coalesce(country, '??') AS country, count(DISTINCT "visitorId") AS visitors
        FROM analytics_events WHERE ${cur} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      prisma.$queryRaw<Row[]>`
        SELECT city, max(country) AS country, count(DISTINCT "visitorId") AS visitors
        FROM analytics_events WHERE ${cur} AND city IS NOT NULL
        GROUP BY city ORDER BY 3 DESC LIMIT 10`,
      prisma.$queryRaw<Row[]>`
        SELECT coalesce(device, 'unknown') AS name, count(DISTINCT "visitorId") AS visitors
        FROM analytics_events WHERE ${cur} GROUP BY 1 ORDER BY 2 DESC`,
      prisma.$queryRaw<Row[]>`
        SELECT coalesce(browser, 'Other') AS name, count(DISTINCT "visitorId") AS visitors
        FROM analytics_events WHERE ${cur} GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
      prisma.$queryRaw<Row[]>`
        SELECT count(DISTINCT "sessionId") AS visited,
               count(DISTINCT "sessionId") FILTER (WHERE type = 'product_view') AS viewed,
               count(DISTINCT "sessionId") FILTER (WHERE type = 'add_to_cart') AS carted,
               count(DISTINCT "sessionId") FILTER (WHERE type = 'checkout_start') AS checkout,
               count(DISTINCT "sessionId") FILTER (WHERE type = 'whatsapp_order') AS ordered
        FROM analytics_events WHERE ${cur}`,
      prisma.$queryRaw<Row[]>`
        SELECT type, path, label, country, city, device,
               to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
        FROM analytics_events ORDER BY analytics_events."createdAt" DESC LIMIT 40`,
    ]);

    const toTotals = (r: Row = {}) => ({
      visitors: n(r.visitors),
      sessions: n(r.sessions),
      pageViews: n(r.pageViews),
      productViews: n(r.productViews),
      addToCart: n(r.addToCart),
      checkouts: n(r.checkouts),
      whatsappOrders: n(r.whatsappOrders),
      orderValue: n(r.orderValue),
      clicks: n(r.clicks),
      whatsappClicks: n(r.whatsappClicks),
    });

    // Fill empty buckets so the chart shows a continuous timeline.
    const bucketMs = unit === "hour" ? 3_600_000 : DAY;
    const byBucket = new Map(
      series.map((r) => [Date.parse(String(r.bucket)), r])
    );
    const startLocal = startMs + LAGOS_OFFSET;
    const endLocal = now + LAGOS_OFFSET;
    const filled = [];
    for (let t = startLocal; t <= endLocal; t += bucketMs) {
      const key = Math.floor(t / bucketMs) * bucketMs;
      const r = byBucket.get(key);
      filled.push({
        bucket: new Date(key).toISOString(),
        visitors: n(r?.visitors),
        pageViews: n(r?.pageViews),
        orders: n(r?.orders),
      });
    }

    // Merge referrer domains into friendly source names.
    const sourceMap = new Map<string, number>();
    for (const r of sources) {
      const name = sourceName(String(r.source));
      sourceMap.set(name, (sourceMap.get(name) ?? 0) + n(r.sessions));
    }

    const b = bounce[0] ?? {};
    return NextResponse.json({
      range: rangeKey,
      unit,
      totals: toTotals(totals[0]),
      previous: toTotals(prevTotals[0]),
      bounceRate: n(b.total) ? n(b.bounced) / n(b.total) : 0,
      liveVisitors: n(live[0]?.visitors),
      series: filled,
      topPages: topPages.map((r) => ({ path: r.path, views: n(r.views), visitors: n(r.visitors) })),
      topProducts: topProducts.map((r) => ({
        slug: r.slug,
        name: r.name,
        views: n(r.views),
        viewers: n(r.viewers),
        carts: n(r.carts),
      })),
      topClicks: topClicks.map((r) => ({ label: r.label, href: r.href, clicks: n(r.clicks) })),
      sources: [...sourceMap.entries()]
        .map(([source, sessions]) => ({ source, sessions }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10),
      countries: countries.map((r) => ({ country: r.country, visitors: n(r.visitors) })),
      cities: cities.map((r) => ({ city: r.city, country: r.country, visitors: n(r.visitors) })),
      devices: devices.map((r) => ({ name: r.name, visitors: n(r.visitors) })),
      browsers: browsers.map((r) => ({ name: r.name, visitors: n(r.visitors) })),
      funnel: {
        visited: n(funnel[0]?.visited),
        viewed: n(funnel[0]?.viewed),
        carted: n(funnel[0]?.carted),
        checkout: n(funnel[0]?.checkout),
        ordered: n(funnel[0]?.ordered),
      },
      recent: recent.map((r) => ({
        type: r.type,
        path: r.path,
        label: r.label,
        country: r.country,
        city: r.city,
        device: r.device,
        createdAt: String(r.createdAt),
      })),
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
