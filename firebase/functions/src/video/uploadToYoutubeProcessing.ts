import { onTaskDispatched } from "firebase-functions/tasks";
import { google, youtube_v3 } from "googleapis";
import { Readable } from "stream";
import axios from "axios";
import { db } from "../../firebaseConfig";
import { defineSecret } from "firebase-functions/params";
import Schema$Video = youtube_v3.Schema$Video;

/**
 * This Firebase Function handles uploading videos to YouTube.
 * 
 * Note: We're using Firebase Functions Secrets here to access the Google client ID and secret,
 * which is the recommended approach for Firebase Functions. The Next.js API routes use
 * environment variables to access the same values, which is the standard approach for Next.js.
 * 
 * Both approaches access the same Google client ID and secret, just in different ways
 * appropriate to their respective environments.
 */

// Environment variables for Google OAuth
const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");

export const processYoutubeUploadQueue = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 5 },
    rateLimits: { maxConcurrentDispatches: 1 },
    memory: "2GiB",
    secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET],
  },
  async (event): Promise<void> => {
    try {
      const { videoId, channelId, publishAt, privacy } = event.data;
      if (!videoId || !channelId) {
        console.error("Missing videoId or channelId");
        return;
      }
      
      // Log all data received including timezone if it exists
      const timezone = event.data.timezone;
      console.log("Processing YouTube upload task with data:", {
        videoId, 
        channelId, 
        publishAt, 
        timezone: timezone || 'not provided', 
        privacy
      });

      // Handle publishAt date with timezone
      let formattedPublishAt: string | undefined = undefined;
      if (publishAt) {
        try {
          // Parse the date and format it to ISO 8601 format with UTC timezone that YouTube API requires
          // Note: YouTube API requires RFC 3339 format which is close to ISO 8601
          formattedPublishAt = new Date(publishAt).toISOString();
          console.log(`Formatted publishAt date: ${formattedPublishAt} (original timezone info: ${timezone || 'not provided'})`);
        } catch (error) {
          console.error("Error formatting publishAt date:", error);
          // If there's an error, we'll continue without a publish date
        }
      }

      // Fetch video document from Firestore
      const videoRef = db.collection("videos").doc(videoId);
      const videoDoc = await videoRef.get();
      if (!videoDoc.exists) {
        console.error("Video not found");
        return;
      }
      const videoData = videoDoc.data();
      if (!videoData?.renderStatus?.videoUrl) {
        console.error("Video file URL not found in document");
        return;
      }
      console.log("Found video URL:", videoData.renderStatus.videoUrl);

      // Fetch the YouTube channel account from Firestore
      const accountRef = db.collection("accounts").doc(channelId);
      const accountDoc = await accountRef.get();
      if (!accountDoc.exists) {
        console.error("YouTube account not found");
        return;
      }
      const accountData = accountDoc.data();
      if (!accountData?.token || !accountData?.refreshToken) {
        console.error("Missing YouTube OAuth tokens in account");
        return;
      }

      // Download the video file from the AWS URL (not from Firebase Storage)
      console.log("Downloading video file from AWS URL...");
      const awsResponse = await axios.get(videoData.renderStatus.videoUrl, {
        responseType: "arraybuffer",
      });
      const videoBuffer = Buffer.from(awsResponse.data);
      const videoStream = Readable.from(videoBuffer);
      console.log("Video file downloaded successfully.");

      // Set up YouTube OAuth2 client with stored tokens
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID.value(),
        GOOGLE_CLIENT_SECRET.value(),
      );
      oauth2Client.setCredentials({
        access_token: accountData.token,
        refresh_token: accountData.refreshToken,
      });

      // Refresh access token if needed
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log("Access token refreshed successfully");
        await accountRef.update({
          token: credentials.access_token,
          refreshToken: credentials.refresh_token || accountData.refreshToken,
        });
        oauth2Client.setCredentials({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || accountData.refreshToken,
        });
      } catch (refreshError) {
        console.error("Failed to refresh access token:", refreshError);
        return;
      }

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Build the request body for uploading
      const requestBody: Schema$Video = {
        snippet: {
          title: videoData.title,
          description: videoData.description,
        },
        status: {
          privacyStatus: privacy || videoData.privacy || "private",
          selfDeclaredMadeForKids: false,
          // Only include publishAt for non-public videos (private/unlisted)
          publishAt: (privacy === "public") ? undefined : formattedPublishAt,
        },
      };

      console.log("Uploading video to YouTube with request body:", requestBody);

      // Upload the video to YouTube with onUploadProgress callback.
      const response = await youtube.videos.insert(
        {
          part: ["snippet", "status"],
          requestBody,
          media: { body: videoStream },
        },
        {
          onUploadProgress: async (progressEvent: any) => {
            if (progressEvent.total) {
              const progress =
                (progressEvent.loaded / progressEvent.total) * 100;
              console.log(`Upload progress: ${progress.toFixed(2)}%`);
              // Update Firestore with the current upload progress
              await videoRef.update({
                uploadStatus: {
                  youtube: {
                    progress: progress,
                    videoId: null,
                    videoUrl: null,
                  },
                },
              });
            }
          },
        },
      );

      const youtubeVideoId = response.data.id;
      console.log("YouTube upload successful, video ID:", youtubeVideoId);

      // Update Firestore with the final YouTube video ID and URL
      await videoRef.update({
        youtubeVideoId,
        uploadStatus: {
          youtube: {
            progress: 100,
            videoId: youtubeVideoId,
            videoUrl: `https://youtu.be/${youtubeVideoId}`,
          },
        },
      });
    } catch (error: any) {
      console.error("YouTube upload failed:", error);
      throw error;
    }
  },
);
