import { google } from "googleapis";
import { db } from "@/lib/firebaseAdmin";
import { NotFoundError } from "@/lib/api/middleware/withErrorHandling";
import { getAccountById, createOAuth2Client, refreshOAuth2Token } from "@/services/accounts/accountService";

/**
 * Uploads a video to YouTube
 * @param videoId The ID of the video in our database
 * @param accountId The ID of the YouTube account to upload to
 * @param userId The ID of the user
 * @returns The YouTube video ID and upload status
 */
export async function uploadVideoToYoutube(
  videoId: string,
  accountId: string,
  userId: string
): Promise<{ youtubeVideoId: string; status: string }> {
  // Get the video data
  const videoDoc = await db.collection("videos").doc(videoId).get();
  if (!videoDoc.exists) {
    throw new NotFoundError("Video not found");
  }
  
  const videoData = videoDoc.data();
  if (!videoData) {
    throw new NotFoundError("Video data not found");
  }
  
  // Get the account data
  const accountData = await getAccountById(accountId, userId);
  
  // Create OAuth2 client
  let oauth2Client = createOAuth2Client(accountData);
  
  // Refresh the token
  oauth2Client = await refreshOAuth2Token(
    accountId,
    oauth2Client,
    accountData.refreshToken
  );
  
  // Get YouTube API client
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  
  // Upload the video
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: videoData.title,
        description: videoData.description || "",
        tags: videoData.tags || [],
        categoryId: videoData.categoryId || "22", // People & Blogs
      },
      status: {
        privacyStatus: videoData.privacyStatus || "private",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: videoData.videoUrl, // This should be a readable stream
    },
  });
  
  // Update the video in our database
  await db.collection("videos").doc(videoId).update({
    youtubeVideoId: res.data.id,
    youtubeUploadStatus: "completed",
    updatedAt: new Date().toISOString(),
  });
  
  return {
    youtubeVideoId: res.data.id || "",
    status: "completed",
  };
}

/**
 * Gets the status of a YouTube upload
 * @param videoId The ID of the video in our database
 * @param userId The ID of the user
 * @returns The upload status
 */
export async function getYoutubeUploadStatus(
  videoId: string,
  userId: string
): Promise<{ status: string; youtubeVideoId?: string }> {
  // Get the video data
  const videoDoc = await db.collection("videos").doc(videoId).get();
  if (!videoDoc.exists) {
    throw new NotFoundError("Video not found");
  }
  
  const videoData = videoDoc.data();
  if (!videoData) {
    throw new NotFoundError("Video data not found");
  }
  
  // Check if the video belongs to the user
  if (videoData.userId !== userId) {
    throw new NotFoundError("Video not found");
  }
  
  return {
    status: videoData.youtubeUploadStatus || "not_started",
    youtubeVideoId: videoData.youtubeVideoId,
  };
}

/**
 * Handles the YouTube upload callback
 * @param videoId The ID of the video in our database
 * @param status The upload status
 * @param youtubeVideoId The YouTube video ID
 * @returns Promise that resolves when the callback is processed
 */
export async function handleYoutubeUploadCallback(
  videoId: string,
  status: string,
  youtubeVideoId?: string
): Promise<void> {
  // Update the video in our database
  await db.collection("videos").doc(videoId).update({
    youtubeVideoId,
    youtubeUploadStatus: status,
    updatedAt: new Date().toISOString(),
  });
}