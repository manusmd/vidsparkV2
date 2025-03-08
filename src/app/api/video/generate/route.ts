import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const { videoId, title, description, voiceId, scenes } = await req.json();
    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    // Update the video document with the provided data
    await db.collection("videos").doc(videoId).update({
      title,
      description,
      voiceId,
      scenes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "processing:video", // update the processing stage as needed
    });

    // Create a pending entry for further processing
    await db.collection("pendingVideos").add({
      videoId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: "Video updated and pending entry created.",
    });
  } catch (error: any) {
    console.error("Error updating video and writing pending entry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
