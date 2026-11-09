import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/shop/cache";
import { NIGERIAN_STATES } from "@/lib/shipping/states";
import { feeFor, getDeliveryRules, resolveState } from "@/lib/agent/delivery";
import { GUO_CARRIER_NAME, getGuoCenters } from "@/lib/shipping/guo-locations";

// GET /api/agent/delivery
//   -> every state with its delivery fee (+ free-delivery threshold, timeline)
// GET /api/agent/delivery?location=ibadan[&subtotal=45000]
//   -> the resolved state, its fee, what this order would pay, and the GUO
//      pickup centers there.
// Dailzero agent tool. Public, read-only: fees and pickup addresses only.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const location = (params.get("location") || params.get("state") || "").trim();
    const subtotalRaw = params.get("subtotal");
    const subtotal = subtotalRaw ? Number(subtotalRaw) : null;

    const rules = await getDeliveryRules();
    const general = {
      carrier: GUO_CARRIER_NAME,
      timeline: rules.timeline,
      defaultFee: rules.defaultFee,
      freeDeliveryFrom: rules.freeDeliveryThreshold,
      currency: "NGN",
    };

    if (!location) {
      return cachedJson(
        { ...general, states: NIGERIAN_STATES.map((s) => feeFor(s, rules)) },
        60
      );
    }

    const state = resolveState(location);
    if (!state) {
      return NextResponse.json(
        {
          ...general,
          found: false,
          query: location,
          message: `Couldn't match "${location}" to a Nigerian state. Ask the customer which state they're in. Most states pay the default fee.`,
        },
        { status: 404 }
      );
    }

    const fee = feeFor(state, rules);
    const orderFee =
      subtotal != null && Number.isFinite(subtotal)
        ? fee.freeDeliveryFrom != null && subtotal >= fee.freeDeliveryFrom
          ? 0
          : fee.fee
        : undefined;

    return cachedJson(
      {
        ...general,
        found: true,
        query: location,
        ...fee,
        ...(orderFee !== undefined ? { subtotal, deliveryFeeForOrder: orderFee } : {}),
        pickupCenters: getGuoCenters(state.slug),
      },
      60
    );
  } catch (error) {
    console.error("Agent delivery lookup error:", error);
    return NextResponse.json({ error: "Delivery lookup failed" }, { status: 500 });
  }
}
