import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";

// Schema for updating video details
const VideoUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

// PATCH - Update a video's details
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
    const parseResult = VideoUpdateSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { title, description } = parseResult.data;
    
    // Use a specific type for Firestore compatibility
    const updateData: {
      title?: string;
      description?: string;
    } = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // Only update if there are valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the video in Firestore
    const videoRef = db.collection("videos").doc(id);
    await videoRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating video:", err);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
} 