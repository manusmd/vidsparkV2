import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { environment } from "@/lib/environment";

// GET: Retrieve all content types
export async function GET() {
  try {
    const snapshot = await db.collection("contentTypes").get();
    const contentTypes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(contentTypes);
  } catch (error: unknown) {
    console.error("Error fetching content types:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create a new content type
export async function POST(req: Request) {
  try {
    const { title, description, examples, prompt, recommendedVoiceId, order, imageUrl, imagePrompt } =
      await req.json();
    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing title or description" },
        { status: 400 },
      );
    }
    
    // Save initial data to Firestore
    const contentData = {
      title,
      description,
      examples: Array.isArray(examples) ? examples : [],
      prompt: prompt || "",
      recommendedVoiceId: recommendedVoiceId || "",
      imageUrl: imageUrl || "",
      imagePrompt: imagePrompt || "",
      order: typeof order !== 'undefined' ? order : 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("contentTypes").add(contentData);

    // If the imageUrl contains "replicate", download and re-upload to Firebase Storage.
    if (imageUrl && imageUrl.includes("replicate")) {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image from replicate");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Create a file in the "contentTypes" folder using the doc ID.
      const filePath = `contentTypes/${docRef.id}.jpg`;
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
    console.error("Error creating content type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
