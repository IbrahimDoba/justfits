// Fetch live shipment status from carriers via the TrackingMore API
// (https://www.trackingmore.com). Needs TRACKINGMORE_API_KEY in the
// environment; without it, tracking stays manual (number + carrier link).

import { getCarrier } from "./carriers";

const API_BASE = "https://api.trackingmore.com/v4";

export interface TrackingRefreshResult {
  ok: boolean;
  /** Human-readable status, e.g. "In transit — Arrived at Jibowu hub" */
  status?: string;
  error?: string;
}

interface TrackingMoreItem {
  delivery_status?: string;
  latest_event?: string;
  tracking_number?: string;
}

async function tmRequest(
  apiKey: string,
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<{ code: number; data: unknown }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Tracking-Api-Key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
    // Carrier updates are slow-moving; avoid hammering their API.
    next: { revalidate: 0 },
  });
  const json = await res.json().catch(() => ({}));
  return { code: json?.meta?.code ?? res.status, data: json?.data };
}

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: "Label created / awaiting carrier scan",
  notfound: "Not found by carrier yet",
  transit: "In transit",
  pickup: "Out for pickup / ready for pickup",
  delivered: "Delivered",
  undelivered: "Delivery attempt failed",
  exception: "Exception — check with carrier",
  expired: "No updates from carrier (expired)",
  inforeceived: "Carrier has received shipment info",
};

export async function refreshTracking(
  carrierSlug: string,
  trackingNumber: string
): Promise<TrackingRefreshResult> {
  const apiKey = process.env.TRACKINGMORE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Auto-refresh is not configured. Set TRACKINGMORE_API_KEY to enable it.",
    };
  }

  const carrier = getCarrier(carrierSlug);
  if (!carrier) {
    return { ok: false, error: `Unknown carrier: ${carrierSlug}` };
  }
  if (!carrier.trackingMoreCode) {
    return {
      ok: false,
      error: `${carrier.name} does not support auto-refresh yet — track manually on ${carrier.trackingPageUrl}`,
    };
  }

  try {
    // Register the tracking number (idempotent — "already exists" is fine).
    const created = await tmRequest(apiKey, "POST", "/trackings/create", {
      tracking_number: trackingNumber,
      courier_code: carrier.trackingMoreCode,
    });
    // 200 = created, 4101 = already exists; anything else is a real error.
    if (created.code !== 200 && created.code !== 4101) {
      return {
        ok: false,
        error: `Carrier lookup failed (code ${created.code})`,
      };
    }

    const got = await tmRequest(
      apiKey,
      "GET",
      `/trackings/get?tracking_numbers=${encodeURIComponent(trackingNumber)}&courier_code=${carrier.trackingMoreCode}`
    );
    const item = (got.data as TrackingMoreItem[] | undefined)?.find(
      (t) => t.tracking_number === trackingNumber
    );
    if (!item) {
      return { ok: false, error: "No tracking data returned yet — try again later" };
    }

    const label =
      DELIVERY_STATUS_LABELS[item.delivery_status ?? ""] ??
      item.delivery_status ??
      "Unknown";
    const status = item.latest_event ? `${label} — ${item.latest_event}` : label;
    return { ok: true, status };
  } catch (error) {
    console.error("Tracking refresh error:", error);
    return { ok: false, error: "Failed to reach tracking service" };
  }
}
