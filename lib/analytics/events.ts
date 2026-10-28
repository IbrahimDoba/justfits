// Shared analytics event vocabulary (client tracker + ingest API + dashboard).

export const EVENT_TYPES = [
  "page_view",
  "click",
  "product_view",
  "add_to_cart",
  "checkout_start",
  "whatsapp_order",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface TrackEvent {
  type: EventType;
  path: string;
  label?: string;
  href?: string;
  productSlug?: string;
  value?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface TrackPayload {
  visitorId: string;
  sessionId: string;
  events: TrackEvent[];
}
