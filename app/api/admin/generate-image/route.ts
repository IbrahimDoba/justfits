import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateModelShot } from "@/lib/services/openai";
import { generateGeminiImage } from "@/lib/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      sourceImageUrl,
      referenceImagePath,
      productName,
      view,
      background,
      additionalDetails,
      engine = "openai", // Default to openai
      model,
    } = await request.json();

    // Validate required parameters
    if (!sourceImageUrl) {
      return NextResponse.json(
        { error: "Please upload a product image first" },
        { status: 400 }
      );
    }

    if (!referenceImagePath) {
      return NextResponse.json(
        { error: "Please select a model reference image" },
        { status: 400 }
      );
    }

    console.log(`Generating model shot using ${engine} with:`, {
      productName,
      referenceImagePath,
      view,
      background,
      hasSourceImage: !!sourceImageUrl,
    });

    let imageUrl: string;

    if (engine === "gemini") {
      // Generate or edit image using Gemini's "Nano Banana"
      imageUrl = await generateGeminiImage({
        productImageUrl: sourceImageUrl,
        referenceImagePath,
        productName: productName || "clothing item",
        view: view || "Front View",
        background: background || "Studio White",
        additionalDetails,
        model: model || "gemini-2.5-flash-image",
      });
    } else {
      // Generate model shot using GPT-Image via OpenAI Responses API
      imageUrl = await generateModelShot({
        productImageUrl: sourceImageUrl,
        referenceImagePath,
        productName: productName || "clothing item",
        view: view || "Front View",
        background: background || "Studio White",
        additionalDetails,
        model: model || "gpt-4.1",
      });
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
