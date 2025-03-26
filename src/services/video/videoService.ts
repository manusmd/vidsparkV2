import { db } from "@/lib/firebaseAdmin";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface VideoData {
  userId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // For other properties
}

export interface CreateVideoData {
  userId: string;
  title: string;
  description?: string;
  [key: string]: unknown; // For other properties
}

/**
 * Gets a video by ID and verifies ownership
 * @param videoId The video ID to fetch
 * @param userId The user ID to verify ownership
 * @returns The video data
 * @throws NotFoundError if the video doesn't exist
 * @throws UnauthorizedError if the user doesn't own the video
 */
export async function getVideoById(videoId: string, userId: string): Promise<VideoData & { id: string }> {
  const videoDoc = await db.collection("videos").doc(videoId).get();

  if (!videoDoc.exists) {
    throw new NotFoundError("Video not found");
  }

  const videoData = videoDoc.data() as VideoData;
  if (!videoData) {
    throw new NotFoundError("Video data not found");
  }

  if (videoData.userId !== userId) {
    throw new UnauthorizedError("You don't have permission to access this video");
  }

  return {
    id: videoDoc.id,
    ...videoData,
  };
}

/**
 * Gets all videos for a user
 * @param userId The user ID
 * @returns Array of videos
 */
export async function getUserVideos(userId: string): Promise<Array<VideoData & { id: string }>> {
  const snapshot = await db
    .collection("videos")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as VideoData),
  }));
}

/**
 * Creates a new video
 * @param videoData The video data
 * @returns The ID of the created video
 */
export async function createVideo(videoData: CreateVideoData): Promise<string> {
  const now = new Date().toISOString();
  
  const docRef = await db.collection("videos").add({
    ...videoData,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates a video
 * @param videoId The video ID to update
 * @param userId The user ID to verify ownership
 * @param updateData The data to update
 * @returns Promise that resolves when the video is updated
 */
export async function updateVideo(
  videoId: string,
  userId: string,
  updateData: Partial<VideoData>
): Promise<void> {
  // Verify ownership first
  await getVideoById(videoId, userId);

  // Update the video
  await db.collection("videos").doc(videoId).update({
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a video
 * @param videoId The video ID to delete
 * @param userId The user ID to verify ownership
 * @returns Promise that resolves when the video is deleted
 */
export async function deleteVideo(videoId: string, userId: string): Promise<void> {
  // Verify ownership first
  await getVideoById(videoId, userId);

  // Delete the video
  await db.collection("videos").doc(videoId).delete();
}