import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// PUT: Update a content type
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title, description, examples, prompt, recommendedVoiceId } =
      await req.json();
    if (!id || !title || !description) {
      return NextResponse.json(
        { error: "Missing id, title, or description" },
        { status: 400 },
      );
    }
    const contentData = {
      title,
      description,
      examples: Array.isArray(examples) ? examples : [],
      prompt: prompt || "",
      recommendedVoiceId: recommendedVoiceId || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("contentTypes").doc(id).update(contentData);
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
