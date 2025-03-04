import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

export async function POST(req: Request) {
  try {
    const { contentType, customPrompt } = await req.json();
    if (!contentType) {
      return NextResponse.json(
        { error: "Missing contentType" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env
    });

    // Define the structured output format using Zod (inside handler)
    const StorySchema = z.object({
      title: z.string(),
      description: z.string(),
      scenes: z.array(
        z.object({
          narration: z.string(),
          imagePrompt: z.string(),
        }),
      ),
    });

    // Build messages array with optional custom prompt
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an AI that generates structured YouTube/TikTok video stories.`,
      },
      {
        role: "user",
        content: `Generate a structured AI story about ${contentType}. It should contain:
        - A creative title
        - A short YouTube-style description
        - 3-5 scenes, each with a narration and an image prompt.
        ${customPrompt ? `Use the following custom prompt to guide the story:\n"${customPrompt}"` : ""}
        Return JSON matching the schema.`,
      },
    ];

    // Use structured response format with OpenAI + Zod
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages,
      response_format: zodResponseFormat(StorySchema, "story"),
    });

    const story = completion.choices[0].message.parsed;

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
