import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

// GET: Retrieve all music tracks
export async function GET() {
  try {
    const snapshot = await db.collection("musicTracks").get();
    const musicTracks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ musicTracks });
  } catch (error: unknown) {
    console.error("Error fetching music tracks:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create a new music track
export async function POST(req: Request) {
  try {
    const { title, src } = await req.json();
    if (!title || !src) {
      return NextResponse.json(
        { error: "Missing title or src" },
        { status: 400 },
      );
    }
    const musicData = {
      title,
      src,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("musicTracks").add(musicData);
    return NextResponse.json({ id: docRef.id, ...musicData });
  } catch (error: unknown) {
    console.error("Error creating music track:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
