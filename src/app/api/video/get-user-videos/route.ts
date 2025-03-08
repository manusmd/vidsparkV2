import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const snapshot = await db
      .collection("videos")
      .where("uid", "==", uid)
      .get();
    const videos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error getting user videos:", error);

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
