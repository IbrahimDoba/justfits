import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productName } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Generate description using GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a premium fashion copywriter for JUSTFITS, a luxury car-themed caps brand. Write compelling, concise product descriptions that:
- Are 2-3 sentences max
- Highlight premium quality and style
- Appeal to car enthusiasts and fashion-forward customers
- Use a confident, aspirational tone
- Don't use generic phrases like "perfect for" or "great for"
Only return the description text, nothing else.`,
        },
        {
          role: "user",
          content: `Write a product description for: ${productName}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const description = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      slug,
      description,
    });
  } catch (error) {
    console.error("Generate product details error:", error);
    return NextResponse.json(
      { error: "Failed to generate product details" },
      { status: 500 }
    );
  }
}
