// app/api/video/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function DELETE(req: Request) {
  try {
    // Parse the JSON body to get the videoId.
    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId in request body" },
        { status: 400 },
      );
    }

    const videoRef = db.collection("videos").doc(videoId);
    const videoSnapshot = await videoRef.get();
    if (!videoSnapshot.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await videoRef.delete();
    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting video:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
