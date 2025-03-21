import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// PUT: Update a music track
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title, src } = await req.json();
    if (!id || !title || !src) {
      return NextResponse.json(
        { error: "Missing id, title, or src" },
        { status: 400 },
      );
    }
    const musicData = {
      title,
      src,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("musicTracks").doc(id).update(musicData);
    const docSnap = await db.collection("musicTracks").doc(id).get();
    return NextResponse.json({ id, ...docSnap.data() });
  } catch (error: unknown) {
    console.error("Error updating music track:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a music track
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await db.collection("musicTracks").doc(id).delete();
    return NextResponse.json({ message: "Music track deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting music track:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
