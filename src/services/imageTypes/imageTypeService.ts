import { db } from "@/lib/firebaseAdmin";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface ImageType {
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

export interface CreateImageTypeData {
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
 * Gets all image types
 * @returns Array of image types
 */
export async function getAllImageTypes(): Promise<Array<ImageType & { id: string }>> {
  const snapshot = await db
    .collection("imageTypes")
    .where("isActive", "==", true)
    .orderBy("name")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ImageType),
  }));
}

/**
 * Gets a image type by ID
 * @param imageTypeId The image type ID to fetch
 * @returns The image type data
 * @throws NotFoundError if the image type doesn't exist
 */
export async function getImageTypeById(imageTypeId: string): Promise<ImageType & { id: string }> {
  const imageTypeDoc = await db.collection("imageTypes").doc(imageTypeId).get();

  if (!imageTypeDoc.exists) {
    throw new NotFoundError("Image type not found");
  }

  const imageTypeData = imageTypeDoc.data() as ImageType;
  if (!imageTypeData) {
    throw new NotFoundError("Image type data not found");
  }

  return {
    id: imageTypeDoc.id,
    ...imageTypeData,
  };
}

/**
 * Creates a new image type
 * @param imageTypeData The image type data
 * @param userId The ID of the user creating the image type
 * @returns The ID of the created image type
 * @throws UnauthorizedError if the user is not an admin
 */
export async function createImageType(
  imageTypeData: CreateImageTypeData,
  userId: string
): Promise<string> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can create image types");
  }

  const now = new Date().toISOString();
  
  const docRef = await db.collection("imageTypes").add({
    ...imageTypeData,
    thumbnailUrl: imageTypeData.thumbnailUrl || "",
    isActive: imageTypeData.isActive !== undefined ? imageTypeData.isActive : true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  return docRef.id;
}

/**
 * Updates a image type
 * @param imageTypeId The image type ID to update
 * @param updateData The data to update
 * @param userId The ID of the user updating the image type
 * @returns Promise that resolves when the image type is updated
 * @throws UnauthorizedError if the user is not an admin
 */
export async function updateImageType(
  imageTypeId: string,
  updateData: Partial<ImageType>,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can update image types");
  }

  // Update the image type
  await db.collection("imageTypes").doc(imageTypeId).update({
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a image type
 * @param imageTypeId The image type ID to delete
 * @param userId The ID of the user deleting the image type
 * @returns Promise that resolves when the image type is deleted
 * @throws UnauthorizedError if the user is not an admin
 */
export async function deleteImageType(
  imageTypeId: string,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can delete image types");
  }

  // Delete the image type
  await db.collection("imageTypes").doc(imageTypeId).delete();
}

/**
 * Generates a thumbnail image for a image type
 * @param imageTypeId The image type ID
 * @param prompt The prompt for image generation
 * @param userId The ID of the user generating the image
 * @returns The URL of the generated image
 * @throws UnauthorizedError if the user is not an admin
 */
export async function generateThumbnailImage(
  imageTypeId: string,
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

  // Update the image type with the new thumbnail URL
  await db.collection("imageTypes").doc(imageTypeId).update({
    thumbnailUrl: imageUrl,
    updatedAt: new Date().toISOString(),
  });

  return imageUrl;
}