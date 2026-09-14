import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const runtime = "nodejs";
export const maxDuration = 60;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// POST /api/admin/inventory/upload  (multipart: file)
// Uploads server-side to Cloudinary so the browser never talks to Cloudinary
// directly (avoids CORS / ad-blocker "Failed to fetch" issues).
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type || "image/jpeg"};base64,${bytes.toString(
      "base64"
    )}`;

    // Cloudinary can throttle bursts with "Slow Down, Out of Processing
    // Capacity" (HTTP 420). Retry a few times with backoff.
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "justfits/inventory",
          resource_type: "image",
        });
        return NextResponse.json({ url: result.secure_url });
      } catch (e: unknown) {
        lastErr = e;
        const err = e as { http_code?: number; message?: string };
        const throttled =
          err?.http_code === 420 ||
          err?.http_code === 429 ||
          /slow down|processing capacity/i.test(err?.message || "");
        if (!throttled) throw e;
        await sleep(1500 * (attempt + 1)); // 1.5s, 3s, 4.5s
      }
    }

    console.error("Inventory upload throttled after retries:", lastErr);
    return NextResponse.json(
      {
        error:
          "Cloudinary is rate-limiting uploads right now (out of processing capacity). Wait a minute and try again, one image at a time.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Inventory upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
