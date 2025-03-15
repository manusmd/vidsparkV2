// route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import admin from "firebase-admin";
import { db } from "@/lib/firebaseAdmin";

const RenderQueueSchema = z.object({
  videoId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RenderQueueSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 },
      );
    }
    const { videoId } = parseResult.data;
    const queueEntry = {
      videoId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("videoRenderQueue").add(queueEntry);
    return NextResponse.json({ success: true, queueId: docRef.id });
  } catch (err: unknown) {
    console.error("Error adding to videoRenderQueue:", err);
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.stack || "Unknown error occurred" },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
