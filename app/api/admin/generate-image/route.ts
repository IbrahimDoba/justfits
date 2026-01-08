import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateModelShot } from "@/lib/services/openai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      sourceImageUrl,
      productName,
      view,
      gender,
      skinColor,
      background,
      additionalDetails,
    } = await request.json();

    // Require a source image for proper model shot generation
    if (!sourceImageUrl) {
      return NextResponse.json(
        { error: "Please upload a product image first" },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    console.log("Generating model shot with:", {
      productName,
      view,
      gender,
      skinColor,
      background,
      hasSourceImage: !!sourceImageUrl,
    });

    // Generate model shot using the product image as reference
    const imageUrl = await generateModelShot({
      productImageUrl: sourceImageUrl,
      productName,
      gender: gender || "Female",
      skinColor: skinColor || "Medium",
      view: view || "Front View",
      background: background || "Studio White",
      additionalDetails,
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
