import { db } from "@/lib/firebaseAdmin";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface VideoType {
  name: string;
  description: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  settings: {
    duration: number;
    aspectRatio: string;
    [key: string]: string | number | boolean | null;
  };
}

export interface CreateVideoTypeData {
  name: string;
  description: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  settings: {
    duration: number;
    aspectRatio: string;
    [key: string]: string | number | boolean | null;
  };
}

/**
 * Gets all video types
 * @returns Array of video types
 */
export async function getAllVideoTypes(): Promise<Array<VideoType & { id: string }>> {
  const snapshot = await db
    .collection("videoTypes")
    .where("isActive", "==", true)
    .orderBy("name")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as VideoType),
  }));
}

/**
 * Gets a video type by ID
 * @param videoTypeId The video type ID to fetch
 * @returns The video type data
 * @throws NotFoundError if the video type doesn't exist
 */
export async function getVideoTypeById(videoTypeId: string): Promise<VideoType & { id: string }> {
  const videoTypeDoc = await db.collection("videoTypes").doc(videoTypeId).get();

  if (!videoTypeDoc.exists) {
    throw new NotFoundError("Video type not found");
  }

  const videoTypeData = videoTypeDoc.data() as VideoType;
  if (!videoTypeData) {
    throw new NotFoundError("Video type data not found");
  }

  return {
    id: videoTypeDoc.id,
    ...videoTypeData,
  };
}

/**
 * Creates a new video type
 * @param videoTypeData The video type data
 * @param userId The ID of the user creating the video type
 * @returns The ID of the created video type
 * @throws UnauthorizedError if the user is not an admin
 */
export async function createVideoType(
  videoTypeData: CreateVideoTypeData,
  userId: string
): Promise<string> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can create video types");
  }

  const now = new Date().toISOString();
  
  const docRef = await db.collection("videoTypes").add({
    ...videoTypeData,
    thumbnailUrl: videoTypeData.thumbnailUrl || "",
    isActive: videoTypeData.isActive !== undefined ? videoTypeData.isActive : true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  return docRef.id;
}

/**
 * Updates a video type
 * @param videoTypeId The video type ID to update
 * @param updateData The data to update
 * @param userId The ID of the user updating the video type
 * @returns Promise that resolves when the video type is updated
 * @throws UnauthorizedError if the user is not an admin
 */
export async function updateVideoType(
  videoTypeId: string,
  updateData: Partial<VideoType>,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can update video types");
  }

  // Update the video type
  await db.collection("videoTypes").doc(videoTypeId).update({
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a video type
 * @param videoTypeId The video type ID to delete
 * @param userId The ID of the user deleting the video type
 * @returns Promise that resolves when the video type is deleted
 * @throws UnauthorizedError if the user is not an admin
 */
export async function deleteVideoType(
  videoTypeId: string,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can delete video types");
  }

  // Delete the video type
  await db.collection("videoTypes").doc(videoTypeId).delete();
}

/**
 * Generates a thumbnail image for a video type
 * @param videoTypeId The video type ID
 * @param prompt The prompt for image generation
 * @param userId The ID of the user generating the image
 * @returns The URL of the generated image
 * @throws UnauthorizedError if the user is not an admin
 */
export async function generateThumbnailImage(
  videoTypeId: string,
  prompt: string,
  userId: string
): Promise<string> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can generate thumbnail images");
  }

  // This would call an image generation API in a real implementation
  const imageUrl = `https://example.com/generated-image-${Date.now()}.jpg`;

  // Update the video type with the new thumbnail URL
  await db.collection("videoTypes").doc(videoTypeId).update({
    thumbnailUrl: imageUrl,
    updatedAt: new Date().toISOString(),
  });

  return imageUrl;
}