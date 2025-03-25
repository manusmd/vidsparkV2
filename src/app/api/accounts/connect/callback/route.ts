import { google } from "googleapis";
import { db } from "@/lib/firebaseAdmin";

/**
 * This API route handles the callback from the OAuth flow for connecting a YouTube account.
 * 
 * Note: We're using environment variables here to access the Google client ID and secret,
 * which is the standard approach for Next.js API routes. The Firebase Functions use
 * Firebase Functions Secrets to access the same values, which is the recommended
 * approach for Firebase Functions.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Get userId from state parameter

    if (!code) {
      return new Response("Missing code", { status: 400 });
    }

    if (!state) {
      return new Response("Missing state (userId)", { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/connect/callback`!,
    );
    const { tokens } = await oauth2Client.getToken(code);
    const access_token = tokens.access_token;
    const refresh_token = tokens.refresh_token;
    if (!access_token || !refresh_token) {
      return new Response("Missing tokens", { status: 400 });
    }
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${access_token}`,
    );
    const channelData = await channelRes.json();
    const channelSnippet = channelData.items?.[0]?.snippet || {};
    const channelDescription = channelSnippet.description || "";
    const channelThumbnail = channelSnippet.thumbnails?.default?.url || "";
    const channelId = channelData.items?.[0]?.id;
    if (!channelId) {
      return new Response("Missing channel id", { status: 400 });
    }
    const accountData = {
      provider: "google",
      accountName: channelSnippet.title || "Unknown",
      accountId: channelId,
      token: access_token,
      refreshToken: refresh_token,
      channelDescription,
      channelThumbnail,
      userId: state, // Set userId from state parameter
    };
    await db.collection("accounts").doc(channelId).set(accountData);

    // Return HTML that closes the window
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Connected</title>
          <script>
            window.onload = function() {
              window.close();
            }
          </script>
        </head>
        <body>
          <h1>Account connected successfully!</h1>
          <p>You can close this window now.</p>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error in callback endpoint:", error);

    // Return HTML with error message that closes the window
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.close();
              }, 3000); // Close after 3 seconds
            }
          </script>
        </head>
        <body>
          <h1>Error connecting account</h1>
          <p>There was an error connecting your YouTube account. Please try again.</p>
          <p>This window will close automatically in 3 seconds.</p>
        </body>
      </html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
