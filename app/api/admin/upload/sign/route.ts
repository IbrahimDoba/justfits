import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (it might be already configured in lib/services/cloudinary,
// but re-configuring here ensures this route works independently if needed,
// though typical patterns suggest importing the configured instance.
// However, the signature generation is a static method on the v2 object).

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error signing request:", error);
    return NextResponse.json(
      { error: "Failed to sign request" },
      { status: 500 }
    );
  }
}
