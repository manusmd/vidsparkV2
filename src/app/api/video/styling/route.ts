import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { z } from "zod";

const TextDesignSchema = z.object({
  videoId: z.string(),
  variant: z.string(),
  font: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { videoId, variant, font } = TextDesignSchema.parse(await req.json());
    const textDesignData = {
      variant,
      font,
    };
    await db
      .collection("videos")
      .doc(videoId)
      .set({ styling: textDesignData }, { merge: true });
    return NextResponse.json({
      success: true,
      videoId,
      styling: textDesignData,
    });
  } catch (error: unknown) {
    console.error("Error fetching content types:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
