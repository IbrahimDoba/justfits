import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a model shot using the product image as reference
 * Uses GPT Image model with high input fidelity for accurate product representation
 */
export async function generateModelShot({
  productImageUrl,
  productName,
  gender,
  skinColor,
  view,
  background,
  additionalDetails,
}: {
  productImageUrl: string;
  productName: string;
  gender: string;
  skinColor: string;
  view: string;
  background: string;
  additionalDetails?: string;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  // Fetch the product image and convert to buffer
  const imageResponse = await fetch(productImageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch product image");
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  // Build the prompt for model shot generation
  const viewDescriptions: Record<string, string> = {
    "Front View": "facing the camera directly with a confident expression",
    "Left Profile":
      "turned to show left profile, looking slightly toward camera",
    "Right Profile":
      "turned to show right profile, looking slightly toward camera",
    "3/4 View": "posed at a flattering three-quarter angle",
    Lifestyle: "in a natural relaxed pose, candid lifestyle setting",
    "Action Shot": "in dynamic motion, active lifestyle pose",
  };

  const backgroundDescriptions: Record<string, string> = {
    "Studio White":
      "clean white studio background with professional soft lighting",
    "Studio Gray":
      "professional gray gradient background with dramatic lighting",
    "Urban Street": "stylish urban street setting with blurred city background",
    Minimal: "minimalist solid neutral background",
  };

  const prompt = `Professional e-commerce product photography. Generate a photorealistic image of a stylish ${skinColor.toLowerCase()} skin tone ${gender.toLowerCase()} model wearing the cap/hat shown in the reference image.

The model should be ${viewDescriptions[view] || viewDescriptions["Front View"]}.
Background: ${
    backgroundDescriptions[background] || backgroundDescriptions["Studio White"]
  }.
${additionalDetails ? `Additional styling: ${additionalDetails}` : ""}

IMPORTANT: The cap MUST look exactly like the reference product image - same colors, logos, style, and details. The cap should be the main focus of the image. High fashion e-commerce quality.`;

  try {
    // Use the Image Edit API with the product image as reference
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: await toFile(imageBuffer, "product.png", { type: "image/png" }),
      prompt,
      size: "1024x1024",
      input_fidelity: "high",
    });

    const imageBase64 = result.data?.[0]?.b64_json;
    if (!imageBase64) {
      throw new Error("No image generated");
    }

    // Convert base64 to data URL for frontend display
    return `data:image/png;base64,${imageBase64}`;
  } catch (error: unknown) {
    console.error("OpenAI Image Generation Error:", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        throw new Error(
          "Invalid request. Please try a different image or prompt."
        );
      }
      if (error.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (error.status === 500) {
        throw new Error("OpenAI service error. Please try again.");
      }
    }

    throw new Error("Failed to generate image. Please try again.");
  }
}

/**
 * Legacy function for backwards compatibility - analyzes product image
 */
export async function analyzeProductImage(imageUrl: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set, skipping image analysis");
    return "";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a fashion product analyst. Describe products in extreme detail for image generation.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Describe this cap/hat in detail: style, colors, materials, logos, and design elements. Keep it concise (2-3 sentences).`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI Vision Analysis Error:", error);
    return "";
  }
}

/**
 * Legacy function - simple text-to-image generation with DALL-E 3
 */
export async function generateProductImage(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
      response_format: "url",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return imageUrl;
  } catch (error: unknown) {
    console.error("OpenAI Image Generation Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
}

export { openai };
