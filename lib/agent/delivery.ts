import { prisma } from "@/lib/db/prisma";
import { GUO_CENTERS, getGuoCenters } from "@/lib/shipping/guo-locations";
import { NIGERIAN_STATES, type NigerianState } from "@/lib/shipping/states";
import { collapse } from "@/lib/shop/search";

// Delivery fees shaped for the Dailzero WhatsApp agent. Reads the same
// shipping zones + store settings as checkout (/api/shipping/rate), so the
// agent always quotes what the site would charge.

export interface DeliveryRules {
  defaultFee: number;
  freeDeliveryThreshold: number | null;
  timeline: string;
  zones: Map<string, { price: number; freeShippingThreshold: number | null }>;
}

export async function getDeliveryRules(): Promise<DeliveryRules> {
  const [zones, settings] = await Promise.all([
    prisma.shippingZone.findMany({ where: { isActive: true } }),
    prisma.storeSetting.findUnique({ where: { id: "default" } }),
  ]);
  return {
    defaultFee: settings?.shippingFee ?? 2500,
    freeDeliveryThreshold: settings?.freeShippingThreshold ?? 50000,
    timeline:
      settings?.deliveryTimeline ??
      "3-5 business days within Lagos, 5-7 business days nationwide",
    zones: new Map(
      zones.map((z) => [
        z.state,
        { price: z.price, freeShippingThreshold: z.freeShippingThreshold },
      ])
    ),
  };
}

export function feeFor(state: NigerianState, rules: DeliveryRules) {
  const zone = rules.zones.get(state.slug);
  return {
    state: state.slug,
    label: state.label,
    fee: zone?.price ?? rules.defaultFee,
    freeDeliveryFrom: zone?.freeShippingThreshold ?? rules.freeDeliveryThreshold,
    pickupCenters: getGuoCenters(state.slug).length,
  };
}

const names = (s: NigerianState) =>
  [s.slug, s.label, ...s.cities].map(collapse);

// Resolve free text ("Port Harcourt", "PH", "fct", "lekki", "No 5 Allen
// Avenue, Ikeja") to a state. Whole words only, so "london" never hits Ondo:
// the full query first, then every 1-3 word phrase in it, then GUO branches.
export function resolveState(query: string): NigerianState | null {
  // "nigeria" would otherwise match the Niger state slug.
  const words = query
    .toLowerCase()
    .replace(/\b(state|nigeria)\b/g, " ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const full = words.join("");
  if (!full) return null;

  const phrases = [full];
  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i + n <= words.length; i++) {
      phrases.push(words.slice(i, i + n).join(""));
    }
  }
  for (const p of phrases) {
    const hit = NIGERIAN_STATES.find((s) => names(s).includes(p));
    if (hit) return hit;
  }

  if (full.length >= 4) {
    for (const [slug, centers] of Object.entries(GUO_CENTERS)) {
      if (centers.some((c) => collapse(c.branch).startsWith(full))) {
        return NIGERIAN_STATES.find((s) => s.slug === slug) ?? null;
      }
    }
  }
  return null;
}
