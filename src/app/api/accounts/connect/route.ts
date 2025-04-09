import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * This API route initiates the OAuth flow for connecting a YouTube account.
 * 
 * Note: We're using environment variables here to access the Google client ID and secret,
 * which is the standard approach for Next.js API routes. The Firebase Functions use
 * Firebase Functions Secrets to access the same values, which is the recommended
 * approach for Firebase Functions.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/connect/callback`!,
  );
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload"
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: userId, // Pass the userId as the state parameter
  });
  return NextResponse.json({ url });
}
