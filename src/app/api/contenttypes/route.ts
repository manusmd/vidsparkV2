import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

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
    const { title, description, examples, prompt, recommendedVoiceId } =
      await req.json();
    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing title or description" },
        { status: 400 },
      );
    }
    const contentData = {
      title,
      description,
      examples: Array.isArray(examples) ? examples : [],
      prompt: prompt || "",
      recommendedVoiceId: recommendedVoiceId || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("contentTypes").add(contentData);
    return NextResponse.json({ id: docRef.id, ...contentData });
  } catch (error: unknown) {
    console.error("Error creating content type:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
