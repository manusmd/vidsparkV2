import { NextRequest, NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { environment } from "@/lib/environment";
import { ContentType } from "@/app/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title, description, examples, prompt, recommendedVoiceId, order, imageUrl, imagePrompt } =
      await req.json();
    if (!id || !title || !description) {
      return NextResponse.json(
        { error: "Missing id, title, or description" },
        { status: 400 },
      );
    }

    let finalImageUrl = imageUrl || "";

    // If imageUrl contains "replicate", download and re-upload.
    if (imageUrl && imageUrl.includes("replicate")) {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image from replicate");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Create a file in the "contentTypes" folder using the doc ID.
      const filePath = `contentTypes/${id}_${Date.now()}.jpg`;
      const bucket = storage.bucket(
        `${environment.firebaseProjectId}.firebasestorage.app`,
      );
      const fileRef = bucket.file(filePath);
      await fileRef.save(imageBuffer, {
        metadata: { contentType: "image/jpeg" },
      });

      // Generate a signed URL that expires far in the future.
      const farFuture = new Date("2100-01-01T00:00:00Z").getTime();
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: farFuture,
      });
      finalImageUrl = signedUrl;
    }
    
    // Create data object and filter out undefined values
    const contentData: Partial<ContentType> = {
      title,
      description,
      examples: Array.isArray(examples) ? examples : [],
      prompt: prompt || "",
      recommendedVoiceId: recommendedVoiceId || "",
      imageUrl: finalImageUrl,
      imagePrompt: imagePrompt || "",
    };
    
    // Add the server timestamp (not part of ContentType)
    const updateData: Partial<ContentType> & { updatedAt: admin.firestore.FieldValue } = {
      ...contentData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Only include order if it's not undefined
    if (typeof order !== 'undefined') {
      updateData.order = order;
    }
    
    await db.collection("contentTypes").doc(id).update(updateData);
    const docSnap = await db.collection("contentTypes").doc(id).get();
    return NextResponse.json({ id, ...docSnap.data() });
  } catch (error: unknown) {
    console.error("Error updating content type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a content type
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await db.collection("contentTypes").doc(id).delete();
    return NextResponse.json({ message: "Content type deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting content type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
