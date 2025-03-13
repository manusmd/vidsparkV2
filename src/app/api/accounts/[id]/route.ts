import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await db.collection("accounts").doc(id).delete();
    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
