import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { 
      narration, 
      imageType, 
      voiceId, 
      uid, 
      templateId, 
      styling, 
      textPosition, 
      showTitle, 
      musicId,
      musicVolume 
    } = await req.json();
    
    if (!narration) {
      return NextResponse.json({ error: "Missing narration" }, { status: 400 });
    }

    // Create a new video document with minimal default data.
    const videoData = {
      uid,
      voiceId,
      title: "Pending Story",
      description: "",
      status: "processing:story",
      imageType: imageType || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Include template-related properties if available
      ...(templateId && { templateId }),
      ...(styling && { styling }),
      ...(textPosition && { textPosition }),
      ...(showTitle !== undefined && { showTitle }),
      ...(musicId && { musicId }),
      ...(musicVolume !== undefined && { musicVolume })
    };
    
    const videoRef = await db.collection("videos").add(videoData);
    const videoId = videoRef.id;
    console.log("Created new video document with id:", videoId);

    const requestData = {
      narration,
      imageType: imageType || "",
      videoId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const requestRef = await db.collection("storyRequest").add(requestData);
    console.log("Created storyRequest document with id:", requestRef.id);
    return NextResponse.json({ videoId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in story request endpoint:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
