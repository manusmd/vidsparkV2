import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { prompt, uid } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const ideaData = {
      prompt,
      status: "pending",
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ideaRef = await db.collection("storyIdeas").add(ideaData);

    return NextResponse.json({ ideaId: ideaRef.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
