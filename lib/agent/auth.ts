import { NextResponse } from "next/server";

// Shared bearer-token guard for the Dailzero agent tool endpoints.
// The agent calls these read-only endpoints with `Authorization: Bearer <token>`.
// Set DAILZERO_TOOLS_TOKEN in Vercel (and locally in .env).
export function checkAgentAuth(req: Request): NextResponse | null {
  const expected = process.env.DAILZERO_TOOLS_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Agent tools not configured" },
      { status: 503 }
    );
  }
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // authorized
}
