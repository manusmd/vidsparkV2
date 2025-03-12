import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title, prompt, imageUrl } = await req.json();
    if (!id || !title || !prompt || !imageUrl) {
      return NextResponse.json(
        { error: "Missing id, title, prompt, or imageUrl" },
        { status: 400 },
      );
    }
    const videoTypeData = {
      title,
      prompt,
      imageUrl,
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
