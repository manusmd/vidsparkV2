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
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
