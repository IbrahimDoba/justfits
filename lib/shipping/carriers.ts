// Logistics carriers we ship with. Both tracking pages are client-side apps
// that don't accept the tracking number via URL, so the UI copies the number
// to the clipboard before opening the page.

export interface Carrier {
  slug: string;
  name: string;
  /** Public tracking page where the customer pastes the tracking number. */
  trackingPageUrl: string;
  /** Courier code on TrackingMore (used for auto-refresh), if supported. */
  trackingMoreCode?: string;
}

export const CARRIERS: Record<string, Carrier> = {
  guo: {
    slug: "guo",
    name: "GUO Logistics",
    trackingPageUrl: "https://guologistics.com/track-parcel",
  },
  gig: {
    slug: "gig",
    name: "GIG Logistics",
    trackingPageUrl: "https://giglogistics.com/track-shipment/",
    trackingMoreCode: "gig-logistics",
  },
};

export const CARRIER_OPTIONS = Object.values(CARRIERS).map((c) => ({
  value: c.slug,
  label: c.name,
}));

export function getCarrier(slug: string | null | undefined): Carrier | null {
  if (!slug) return null;
  return CARRIERS[slug] ?? null;
}
