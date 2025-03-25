import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "Missing code parameter" },
      { status: 400 },
    );
  }

  // Parse state (for example, to get the channelId)
  let parsedState = {};
  if (state) {
    try {
      parsedState = JSON.parse(state);
    } catch (err) {
      console.error("Failed to parse state:", err);
    }
  }

  // Initialize the OAuth2 client with your credentials and callback URL.
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
  );

  try {
    // Exchange the authorization code for tokens.
    const { tokens } = await oauth2Client.getToken(code);
    // Optionally, save tokens to a database, set cookies, etc.

    // Build a redirect URL (e.g. to a success page) and include any needed info.
    const redirectUrl = new URL(
      `${process.env.NEXT_PUBLIC_APP_URL}/upload-success`,
    );
    if (tokens.access_token) {
      redirectUrl.searchParams.set("access_token", tokens.access_token);
    }
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set("refresh_token", tokens.refresh_token);
    }
    if (parsedState && (parsedState as any).channelId) {
      redirectUrl.searchParams.set("channelId", (parsedState as any).channelId);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 500 },
    );
  }
}
