import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const { contentType, customPrompt, uid } = await req.json();
    if (!contentType) {
      return NextResponse.json(
        { error: "Missing contentType" },
        { status: 400 },
      );
    }
    if (!uid) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

    // Build messages array with an optional custom prompt
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a professional storyteller that tells stories for shortform content like for YouTube/TikTok video stories. Always use unique story ideas.",
      },
      {
        role: "user",
        content: `Generate a structured AI story about ${customPrompt ? "the following content" : contentType}. It should contain:
- A creative title
- A short YouTube-style description
- 3-5 scenes, each with a narration and an image prompt. The image prompt should lead to a super realistic image. If it makes sense to include people in the image also tell that in the image prompt.
The first scene should be a hook to build tension and keep the user watching
${customPrompt ? `Use the following custom prompt to guide the story:\n"${customPrompt}"` : ""}
Return JSON matching the schema.`,
      },
    ];

    // Use structured response format with OpenAI and Zod
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages,
      response_format: zodResponseFormat(StorySchema, "story"),
    });

    const story = completion.choices[0].message.parsed;

    // Prepare video document data with status and timestamp
    const videoData = {
      uid,
      story,
      status: "processing:voices",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create a new document in the "videos" collection
    const videoRef = await db.collection("videos").add(videoData);

    return NextResponse.json({ story, videoId: videoRef.id });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
