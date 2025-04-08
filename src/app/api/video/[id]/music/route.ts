import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// Schema for music updates
const MusicUpdateSchema = z.object({
  musicUrl: z.string().nullable().optional(),
  musicName: z.string().nullable().optional(),
  musicVolume: z.number().min(0).max(1).optional(),
});

// PATCH - Update music for a video
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
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

    const { musicUrl, musicName, musicVolume } = parseResult.data;

    // Get the current video document
    const videoRef = db.collection("videos").doc(id);
    const videoDoc = await videoRef.get();
    
    if (!videoDoc.exists) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    // Prepare update data with properties from the Video type
    const updateData: {
      updatedAt: admin.firestore.FieldValue;
      musicUrl?: string | null;
      musicName?: string | null;
      musicVolume?: number;
    } = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (musicUrl !== undefined) {
      updateData.musicUrl = musicUrl;
    }
    
    if (musicName !== undefined) {
      updateData.musicName = musicName;
    }
    
    if (musicVolume !== undefined) {
      updateData.musicVolume = musicVolume;
    }
    
    // Update the video document
    await videoRef.update(updateData);

    return NextResponse.json({ 
      success: true,
      music: {
        musicUrl,
        musicName
      }
    });
  } catch (err) {
    console.error("Error updating music:", err);
    return NextResponse.json(
      { error: "Failed to update music" },
      { status: 500 }
    );
  }
} 