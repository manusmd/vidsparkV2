import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { environment } from "@/lib/environment";

export async function GET() {
  try {
    const snapshot = await db.collection("imageTypes").get();
    const imageTypes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(imageTypes);
  } catch (error: unknown) {
    console.error("Error fetching image types:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, prompt, imageUrl, imagePrompt } =
      await req.json();
    if (!title || !prompt || !imageUrl || !imagePrompt) {
      return NextResponse.json(
        { error: "Missing title, prompt, imageUrl or imagePrompt" },
        { status: 400 },
      );
    }

    // Save initial data to Firestore
    const imageTypeData = {
      title,
      description,
      prompt,
      imageUrl, // Save the original URL first
      imagePrompt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("imageTypes").add(imageTypeData);

    // If the imageUrl contains "replicate", download and re-upload to Firebase Storage.
    if (imageUrl.includes("replicate")) {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image from replicate");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Create a file in the "imageTypes" folder using the doc ID.
      const filePath = `imageTypes/${docRef.id}.jpg`;
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

      // Update the Firestore document with the new imageUrl.
      await docRef.update({ imageUrl: signedUrl });
    }

    const updatedDoc = await docRef.get();
    return NextResponse.json({ id: docRef.id, ...updatedDoc.data() });
  } catch (error: unknown) {
    console.error("Error creating image type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}