import { NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { environment } from "@/lib/environment";

export async function POST(req: Request) {
  try {
    // Use request.formData() to parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `music/${file.name}`;

    const bucket = storage.bucket(
      `${environment.firebaseProjectId}.firebasestorage.app`,
    );
    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    await fileRef.makePublic();

    const publicUrl = fileRef.publicUrl();
    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    console.error("Error uploading music track:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
