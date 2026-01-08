import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeProductImage, generateProductImage } from "@/lib/services/openai";

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

    if (!productName && !sourceImageUrl) {
      return NextResponse.json(
        { error: "Product name or source image is required" },
        { status: 400 }
      );
    }

    // Step 1: Analyze the source image if provided
    let productDescription = "";
    if (sourceImageUrl) {
      try {
        productDescription = await analyzeProductImage(sourceImageUrl);
        console.log("Product analysis:", productDescription);
      } catch (error) {
        console.error("Image analysis failed, using product name only:", error);
      }
    }

    // Step 2: Build the generation prompt
    const productInfo = productDescription
      ? `${productName} - ${productDescription}`
      : productName;

    // Map background to prompt description
    const backgroundDescriptions: Record<string, string> = {
      "Studio White": "clean white studio background with soft diffused lighting",
      "Studio Gray": "professional gray gradient studio background with dramatic lighting",
      "Urban Street": "blurred urban street background with natural daylight",
      "Minimal": "minimalist solid color background with soft shadows",
    };

    const backgroundPrompt = backgroundDescriptions[background] || backgroundDescriptions["Studio White"];

    // Map view to pose description
    const viewDescriptions: Record<string, string> = {
      "Front View": "facing the camera directly, head slightly tilted",
      "Left Profile": "turned to show left profile, looking slightly toward camera",
      "Right Profile": "turned to show right profile, looking slightly toward camera",
      "3/4 View": "posed at three-quarter angle to camera",
      "Lifestyle": "in a natural relaxed pose, candid lifestyle shot",
      "Action Shot": "in motion, dynamic action pose",
    };

    const viewPrompt = viewDescriptions[view] || viewDescriptions["Front View"];

    // Construct optimized DALL-E 3 prompt
    const prompt = `Professional high-fashion e-commerce photography. A ${skinColor.toLowerCase()} skin tone ${gender.toLowerCase()} model wearing ${productInfo}.

Pose: ${viewPrompt}
Background: ${backgroundPrompt}
${additionalDetails ? `Style details: ${additionalDetails}` : ""}

Technical requirements:
- Sharp focus on the product (cap/hat)
- Professional studio lighting
- Model should look confident and stylish
- Clean, commercial quality suitable for e-commerce
- 4K resolution, highly detailed texture
- The cap should be clearly visible and the main focus`;

    console.log("Generation prompt:", prompt);

    // Step 3: Generate the image
    const imageUrl = await generateProductImage(prompt);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
