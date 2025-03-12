import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { environment } from "@/lib/environment";

// GET: Retrieve all video types
export async function GET() {
  try {
    const snapshot = await db.collection("videoTypes").get();
    const videoTypes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(videoTypes);
  } catch (error: unknown) {
    console.error("Error fetching video types:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, prompt, imageUrl, imagePrompt } = await req.json();
    if (!title || !prompt || !imageUrl || !imagePrompt) {
      return NextResponse.json(
        { error: "Missing title, prompt, imageUrl or imagePrompt" },
        { status: 400 },
      );
    }

    const videoTypeData = {
      title,
      prompt,
      imageUrl,
      imagePrompt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("videoTypes").add(videoTypeData);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image");
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const filePath = `videoTypes/${docRef.id}.jpg`;
    const bucket = storage.bucket(
      `${environment.firebaseProjectId}.firebasestorage.app`,
    );
    const fileRef = bucket.file(filePath);
    await fileRef.save(imageBuffer, {
      metadata: { contentType: "image/jpeg" },
    });

    const farFuture = new Date("2100-01-01T00:00:00Z").getTime();
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: farFuture,
    });

    await docRef.update({ imageUrl: signedUrl });

    const updatedDoc = await docRef.get();
    return NextResponse.json({ id: docRef.id, ...updatedDoc.data() });
  } catch (error: unknown) {
    console.error("Error creating video type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
