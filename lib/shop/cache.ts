import { NextResponse } from "next/server";

// Public catalogue responses are cached on Vercel's CDN so shoppers hit the
// nearest edge instead of waiting on the function + database every time.
// stale-while-revalidate serves the cached copy instantly while it refreshes
// in the background, so inventory edits show up within about a minute.
export function cachedJson(data: unknown, sMaxAge = 60) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=300`,
    },
  });
}
