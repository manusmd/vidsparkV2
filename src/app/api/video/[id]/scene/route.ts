import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// Schema for adding a new scene
const NewSceneSchema = z.object({
  narration: z.string().default("New scene"),
});

// POST - Add a new scene to a video
export async function POST(
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
    const parseResult = NewSceneSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { narration } = parseResult.data;

    // Get the current video document
    const videoRef = db.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();
    
    if (!videoDoc.exists) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    const videoData = videoDoc.data();
    if (!videoData) {
      return NextResponse.json(
        { error: "Video data is missing" },
        { status: 404 }
      );
    }
    
    // Get existing scenes or initialize empty object
    const existingScenes = videoData.scenes || {};
    
    // Find the next scene index
    const sceneKeys = Object.keys(existingScenes).map(Number);
    const newIndex = sceneKeys.length > 0 ? Math.max(...sceneKeys) + 1 : 0;
    
    // Create the new scene
    const newScene = {
      narration,
      imagePrompt: "",
      imageUrl: null,
      voiceUrl: null,
    };
    
    // Add the new scene to existing scenes
    const updatedScenes = {
      ...existingScenes,
      [newIndex]: newScene
    };
    
    // Update the video document
    await videoRef.update({ scenes: updatedScenes });

    return NextResponse.json({ 
      success: true,
      sceneIndex: newIndex,
      scene: newScene
    });
  } catch (err) {
    console.error("Error adding new scene:", err);
    return NextResponse.json(
      { error: "Failed to add new scene" },
      { status: 500 }
    );
  }
} 