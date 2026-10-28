"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Loader2,
  RefreshCw,
  MousePointerClick,
  Eye,
  Users,
  MessageCircle,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { naira } from "@/components/admin/ui";

type Totals = {
  visitors: number;
  sessions: number;
  pageViews: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  whatsappOrders: number;
  orderValue: number;
  clicks: number;
  whatsappClicks: number;
};

interface Data {
  range: string;
  unit: "hour" | "day";
  totals: Totals;
  previous: Totals;
  bounceRate: number;
  liveVisitors: number;
  series: { bucket: string; visitors: number; pageViews: number; orders: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  topProducts: { slug: string; name: string | null; views: number; viewers: number; carts: number }[];
  topClicks: { label: string; href: string | null; clicks: number }[];
  sources: { source: string; sessions: number }[];
  countries: { country: string; visitors: number }[];
  cities: { city: string; country: string | null; visitors: number }[];
  devices: { name: string; visitors: number }[];
  browsers: { name: string; visitors: number }[];
  funnel: { visited: number; viewed: number; carted: number; checkout: number; ordered: number };
  recent: {
    type: string;
    path: string;
    label: string | null;
    country: string | null;
    city: string | null;
    device: string | null;
    createdAt: string;
  }[];
}

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

const EVENT_LABEL: Record<string, string> = {
  page_view: "Viewed page",
  click: "Clicked",
  product_view: "Viewed product",
  add_to_cart: "Added to cart",
  checkout_start: "Started checkout",
  whatsapp_order: "Sent WhatsApp order",
};

const EVENT_DOT: Record<string, string> = {
  page_view: "bg-gray-300",
  click: "bg-blue-400",
  product_view: "bg-indigo-400",
  add_to_cart: "bg-amber-400",
  checkout_start: "bg-orange-500",
  whatsapp_order: "bg-emerald-500",
};

const fmt = (n: number) => new Intl.NumberFormat("en-NG").format(n);
const pct = (n: number) => `${(n * 100).toFixed(n > 0 && n < 0.1 ? 1 : 0)}%`;

let regionNames: Intl.DisplayNames | null = null;
function countryName(code: string | null) {
  if (!code || code === "??") return "Unknown";
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
}
const flag = (code: string | null) =>
  code && /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)))
    : "🌐";

function timeAgo(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: string, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${r}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load analytics");
      setData(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
    const id = setInterval(() => load(range, true), 60_000);
    return () => clearInterval(id);
  }, [range, load]);

  const t = data?.totals;
  const p = data?.previous;
  const conversion = t && t.sessions ? t.whatsappOrders / t.sessions : 0;
  const prevConversion = p && p.sessions ? p.whatsappOrders / p.sessions : 0;
  const empty = data && data.totals.pageViews === 0 && data.recent.length === 0;

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={24} /> Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            {fmt(data?.liveVisitors ?? 0)} on the site now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  range === r.key ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(range)}
            title="Refresh"
            aria-label="Refresh"
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin" size={26} />
        </div>
      ) : (
        <>
          {empty && (
            <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500">
              No visits recorded in this period yet. Data appears here as customers browse the shop.
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Visitors" value={fmt(t!.visitors)} cur={t!.visitors} prev={p!.visitors} icon={<Users size={16} />} sub={`${fmt(t!.sessions)} visits`} />
            <Kpi label="Page views" value={fmt(t!.pageViews)} cur={t!.pageViews} prev={p!.pageViews} icon={<Eye size={16} />} sub={`${t!.sessions ? (t!.pageViews / t!.sessions).toFixed(1) : "0"} pages per visit`} />
            <Kpi label="WhatsApp orders" value={fmt(t!.whatsappOrders)} cur={t!.whatsappOrders} prev={p!.whatsappOrders} icon={<MessageCircle size={16} />} sub={`${naira(t!.orderValue)} in carts sent`} highlight />
            <Kpi label="Conversion" value={pct(conversion)} cur={conversion} prev={prevConversion} icon={<TrendingUp size={16} />} sub="of visits sent an order" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Kpi label="Product views" value={fmt(t!.productViews)} cur={t!.productViews} prev={p!.productViews} icon={<Package size={16} />} />
            <Kpi label="Added to cart" value={fmt(t!.addToCart)} cur={t!.addToCart} prev={p!.addToCart} icon={<ShoppingCart size={16} />} />
            <Kpi label="Clicks" value={fmt(t!.clicks)} cur={t!.clicks} prev={p!.clicks} icon={<MousePointerClick size={16} />} sub={`${fmt(t!.whatsappClicks)} on WhatsApp links`} />
            <Kpi label="Bounce rate" value={pct(data.bounceRate)} icon={<TrendingDown size={16} />} sub="left after one page" />
          </div>

          {/* Chart */}
          <Card title="Traffic" className="mb-6">
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#111827" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tickFormatter={(v) => bucketLabel(v, data.unit)}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    labelFormatter={(v) => bucketLabel(String(v), data.unit, true)}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#9ca3af" fill="url(#gp)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#111827" fill="url(#gv)" strokeWidth={2} />
                  <Area type="monotone" dataKey="orders" name="WhatsApp orders" stroke="#10b981" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Funnel */}
          <Card title="Shopping funnel" subtitle="Visits that reached each step" className="mb-6">
            <Funnel f={data.funnel} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card title="Top products">
              <Table
                head={["Product", "Views", "Carts"]}
                rows={data.topProducts.map((r) => [
                  <a key="n" href={`/products/${r.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {r.name || r.slug}
                  </a>,
                  fmt(r.views),
                  r.carts ? `${fmt(r.carts)} · ${r.views ? pct(r.carts / r.views) : "—"}` : "—",
                ])}
                empty="No product views yet"
              />
            </Card>
            <Card title="Top pages">
              <Table
                head={["Page", "Views", "Visitors"]}
                rows={data.topPages.map((r) => [r.path, fmt(r.views), fmt(r.visitors)])}
                empty="No page views yet"
              />
            </Card>
            <Card title="Most clicked">
              <Table
                head={["Button / link", "Clicks"]}
                rows={data.topClicks.map((r) => [
                  <span key="l" title={r.href || undefined}>
                    {r.label}
                    {r.href && <span className="block text-[11px] text-gray-400 truncate">{r.href}</span>}
                  </span>,
                  fmt(r.clicks),
                ])}
                empty="No clicks yet"
              />
            </Card>
            <Card title="Traffic sources" subtitle="Where visits came from">
              <Bars items={data.sources.map((s) => ({ name: s.source, value: s.sessions }))} empty="No visits yet" />
            </Card>
            <Card title="Locations">
              <Bars
                items={data.countries.map((c) => ({ name: `${flag(c.country)} ${countryName(c.country)}`, value: c.visitors }))}
                empty="No location data yet"
              />
              {data.cities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Top cities</p>
                  <Bars items={data.cities.map((c) => ({ name: c.city, value: c.visitors }))} />
                </div>
              )}
            </Card>
            <Card title="Devices">
              <Bars items={data.devices.map((d) => ({ name: d.name[0].toUpperCase() + d.name.slice(1), value: d.visitors }))} empty="No data yet" />
              {data.browsers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Browsers</p>
                  <Bars items={data.browsers.map((b) => ({ name: b.name, value: b.visitors }))} />
                </div>
              )}
            </Card>
          </div>

          {/* Recent activity */}
          <Card title="Recent activity" subtitle="Latest events across the site">
            {data.recent.length === 0 ? (
              <p className="text-sm text-gray-400">Nothing yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.recent.map((e, i) => (
                  <li key={i} className="flex items-center gap-3 py-2 text-sm min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${EVENT_DOT[e.type] || "bg-gray-300"}`} />
                    <span className="min-w-0 flex-1 truncate text-gray-700">
                      <span className="font-medium text-gray-900">{EVENT_LABEL[e.type] || e.type}</span>{" "}
                      {e.label ? <span>“{e.label}”</span> : <span className="text-gray-500">{e.path}</span>}
                    </span>
                    <span className="hidden sm:inline text-xs text-gray-400 shrink-0">
                      {flag(e.country)} {e.city || countryName(e.country)} · {e.device}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 w-14 text-right">{timeAgo(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="mt-6 text-xs text-gray-400">
            Anonymous, first-party tracking: no cookies or IP addresses are stored. Devices used to open the admin are excluded,
            so your own browsing doesn&apos;t count. Updates every minute.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function bucketLabel(iso: string, unit: "hour" | "day", long = false) {
  // Buckets are Lagos wall-clock times encoded as UTC; format in UTC.
  const d = new Date(iso);
  if (unit === "hour") {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(long ? { weekday: "short" } : {}),
    timeZone: "UTC",
  });
}

function Kpi({
  label,
  value,
  sub,
  icon,
  cur,
  prev,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  cur?: number;
  prev?: number;
  highlight?: boolean;
}) {
  let delta: React.ReactNode = null;
  if (cur !== undefined && prev !== undefined && (cur > 0 || prev > 0)) {
    if (prev === 0) {
      delta = <span className="text-emerald-600">new</span>;
    } else {
      const change = (cur - prev) / prev;
      delta = (
        <span className={change >= 0 ? "text-emerald-600" : "text-red-500"}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(0)}%
        </span>
      );
    }
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm min-w-0 ${highlight ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-100"}`}>
      <div className={`flex items-center justify-between gap-2 text-xs font-medium ${highlight ? "text-gray-300" : "text-gray-500"}`}>
        <span className="truncate">{label}</span>
        <span className={highlight ? "text-gray-400" : "text-gray-300"}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2 min-w-0">
        <span className="text-xl sm:text-2xl font-semibold truncate">{value}</span>
        {delta && <span className="text-xs font-medium shrink-0">{delta}</span>}
      </div>
      {sub && <div className={`mt-0.5 text-xs truncate ${highlight ? "text-gray-400" : "text-gray-400"}`}>{sub}</div>}
    </div>
  );
}

function Card({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm min-w-0 ${className}`}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Table({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (!rows.length) return <p className="text-sm text-gray-400">{empty}</p>;
  return (
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
          {head.map((h, i) => (
            <th key={h} className={`pb-2 font-medium ${i === 0 ? "w-auto" : "w-20 text-right"}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-50 last:border-0">
            {r.map((c, j) => (
              <td key={j} className={`py-2 ${j === 0 ? "pr-3 truncate text-gray-800" : "text-right text-gray-600 whitespace-nowrap"}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Bars({ items, empty }: { items: { name: string; value: number }[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-gray-400">{empty || "No data"}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.name} className="text-sm">
          <div className="flex justify-between gap-3 mb-1">
            <span className="truncate text-gray-700">{i.name}</span>
            <span className="text-gray-500 shrink-0">{fmt(i.value)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Funnel({ f }: { f: Data["funnel"] }) {
  const steps = [
    { label: "Visited the site", value: f.visited },
    { label: "Viewed a product", value: f.viewed },
    { label: "Added to cart", value: f.carted },
    { label: "Started checkout", value: f.checkout },
    { label: "Sent WhatsApp order", value: f.ordered },
  ];
  const top = Math.max(f.visited, 1);
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = i === 0 ? s.value : steps[i - 1].value;
        const kept = prev ? s.value / prev : 0;
        return (
          <li key={s.label}>
            <div className="flex justify-between gap-3 text-sm mb-1">
              <span className="text-gray-700">
                <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                {s.label}
              </span>
              <span className="text-gray-900 font-medium shrink-0">
                {fmt(s.value)}
                {i > 0 && prev > 0 && <span className="ml-2 text-xs font-normal text-gray-400">{pct(kept)} of previous</span>}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${i === steps.length - 1 ? "bg-emerald-500" : "bg-gray-900"}`}
                style={{ width: `${(s.value / top) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
