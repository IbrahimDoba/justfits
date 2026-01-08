import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
          content: `You are a fashion product analyst. Describe products in extreme detail for image generation. Focus ONLY on the product itself, not any background or model. Be precise and descriptive.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this cap/hat product image. Describe in detail:
1. The exact style (snapback, fitted, dad hat, trucker, etc.)
2. Main colors and any secondary colors
3. Material appearance (cotton, wool, mesh, leather accents, etc.)
4. Any logos, text, or embroidery - describe what they look like
5. Unique design elements (curved vs flat brim, structured vs unstructured, etc.)
6. Any patterns or textures visible

Keep the description concise (2-3 sentences max) but highly descriptive. This will be used to generate model photos wearing this exact product.`,
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

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return imageUrl;
  } catch (error: unknown) {
    console.error("OpenAI Image Generation Error:", error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        throw new Error("Invalid request. The prompt may contain restricted content.");
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

export { openai };
