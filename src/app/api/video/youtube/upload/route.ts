// File: /api/video/upload-to-youtube.ts (API endpoint to enqueue the task)
import { NextRequest, NextResponse } from "next/server";
import { functions } from "@/lib/firebaseAdmin"; // Ensure this exports your initialized Firebase Functions

export async function POST(req: NextRequest) {
  try {
    const { videoId, channelId, publishAt, timezone, privacy } =
      await req.json();
    if (!videoId || !channelId) {
      return NextResponse.json(
        { error: "Missing videoId or channelId" },
        { status: 400 },
      );
    }

    // Enqueue task in the youtubeUploadQueue
    const youtubeQueue = functions.taskQueue("youtubeUploadQueue");
    console.log("Enqueuing YouTube upload task with data:", {
      videoId,
      channelId,
      publishAt,
      timezone,
      privacy,
    });
    
    // Ensure publishAt is properly converted to ISO string if it exists
    const formattedPublishAt = publishAt ? new Date(publishAt).toISOString() : undefined;
    
    await youtubeQueue.enqueue({
      videoId,
      channelId,
      publishAt: formattedPublishAt,
      timezone,
      privacy,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error enqueuing upload task:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
