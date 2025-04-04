import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";

// Schema for updating music settings
const MusicUpdateSchema = z.object({
  musicVolume: z.number(),
  musicUrl: z.string().nullable(),
});

// PATCH - Update a video's music settings
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
    const parseResult = MusicUpdateSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { musicVolume, musicUrl } = parseResult.data;

    // Update the video in Firestore
    const videoRef = db.collection("videos").doc(videoId);
    await videoRef.update({ musicVolume, musicUrl });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating music settings:", err);
    return NextResponse.json(
      { error: "Failed to update music settings" },
      { status: 500 }
    );
  }
} 