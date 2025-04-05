import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { z } from "zod";

const MusicSchema = z.object({
  videoId: z.string(),
  musicVolume: z.number(),
  musicUrl: z.string().nullable(),
  musicId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { videoId, musicVolume, musicUrl, musicId } = MusicSchema.parse(
      await req.json(),
    );
    await db
      .collection("videos")
      .doc(videoId)
      .set({ musicVolume, musicUrl, musicId }, { merge: true });
    return NextResponse.json({
      success: true,
      videoId,
      musicVolume,
      musicUrl,
      musicId,
    });
  } catch (error: unknown) {
    console.error("Error updating music:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
