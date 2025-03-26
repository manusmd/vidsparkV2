import { NextResponse } from "next/server";
import admin from "firebase-admin";

/**
 * Middleware to handle authentication for API routes
 * @param handler The route handler function
 * @returns A wrapped handler function that includes authentication
 */
export const withAuth = <T extends Record<string, string>>(
  handler: (
    req: Request,
    context: { params: T },
    userId: string
  ) => Promise<NextResponse>
) => {
  return async (req: Request, context: { params: T }) => {
    try {
      // Extract the authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify the token
      const token = authHeader.replace("Bearer ", "").trim();
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;

      // Call the handler with the authenticated user ID
      return handler(req, context, uid);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
};
