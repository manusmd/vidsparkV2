import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { contentType, customPrompt, uid, voiceId } = await req.json();
    if (!contentType)
      return NextResponse.json(
        { error: "Missing contentType" },
        { status: 400 },
      );
    if (!uid)
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const videoData = {
      uid,
      contentType,
      customPrompt: customPrompt || "",
      title: "Pending...",
      description: "",
      voiceId: voiceId || "",
      scenes: {},
      sceneStatus: {},
      imageStatus: {},
      voiceStatus: {},
      status: "processing:story",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const videoRef = await db.collection("videos").add(videoData);
    return NextResponse.json({ videoId: videoRef.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
