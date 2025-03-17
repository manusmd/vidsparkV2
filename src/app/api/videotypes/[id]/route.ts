import { NextRequest, NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { environment } from "@/lib/environment";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title, description, prompt, imageUrl, imagePrompt } =
      await req.json();
    if (!id || !title || !prompt || !imageUrl) {
      return NextResponse.json(
        { error: "Missing id, title, prompt, or imageUrl" },
        { status: 400 },
      );
    }

    let finalImageUrl = imageUrl;

    // If imageUrl contains "replicate", download and re-upload.
    if (imageUrl.includes("replicate")) {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image from replicate");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Create a file in the "videoTypes" folder using the doc ID.
      const filePath = `videoTypes/${id}_${Date.now()}.jpg`;
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

    const videoTypeData = {
      title,
      description,
      prompt,
      imageUrl: finalImageUrl,
      imagePrompt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("videoTypes").doc(id).update(videoTypeData);
    const docSnap = await db.collection("videoTypes").doc(id).get();
    return NextResponse.json({ id, ...docSnap.data() });
  } catch (error: unknown) {
    console.error("Error updating video type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await db.collection("videoTypes").doc(id).delete();
    return NextResponse.json({
      message: "Video type deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting video type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
