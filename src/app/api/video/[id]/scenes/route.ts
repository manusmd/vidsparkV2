import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// Schema for a scene
const SceneSchema = z.object({
  narration: z.string(),
  imagePrompt: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  voiceUrl: z.string().optional().nullable(),
  captions: z.string().optional(),
  captionsWords: z.array(
    z.object({
      text: z.string(),
      type: z.enum(["word", "spacing", "audio_event"]),
      start: z.number(),
      end: z.number(),
      speaker_id: z.string().optional(),
      characters: z
        .array(
          z.object({
            text: z.string(),
            start: z.number(),
            end: z.number(),
          })
        )
        .optional(),
    })
  ).optional(),
});

// Schema for updating video scenes
const ScenesUpdateSchema = z.object({
  scenes: z.record(z.string(), SceneSchema),
});

// PATCH - Update a video's scenes
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const parseResult = ScenesUpdateSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { scenes } = parseResult.data;

    // Update the video in Firestore
    const videoRef = db.collection("videos").doc(videoId);
    await videoRef.update({ scenes });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating video scenes:", err);
    return NextResponse.json(
      { error: "Failed to update video scenes" },
      { status: 500 }
    );
  }
} 