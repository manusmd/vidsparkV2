import { db } from "@/lib/firebaseAdmin";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface ContentType {
  name: string;
  description: string;
  fields: ContentTypeField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContentTypeField {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
  defaultValue?: string | number | boolean | null;
}

export interface CreateContentTypeData {
  name: string;
  description: string;
  fields: ContentTypeField[];
  isActive?: boolean;
}

/**
 * Gets all content types
 * @returns Array of content types
 */
export async function getAllContentTypes(): Promise<Array<ContentType & { id: string }>> {
  const snapshot = await db
    .collection("contentTypes")
    .where("isActive", "==", true)
    .orderBy("name")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ContentType),
  }));
}

/**
 * Gets a content type by ID
 * @param contentTypeId The content type ID to fetch
 * @returns The content type data
 * @throws NotFoundError if the content type doesn't exist
 */
export async function getContentTypeById(contentTypeId: string): Promise<ContentType & { id: string }> {
  const contentTypeDoc = await db.collection("contentTypes").doc(contentTypeId).get();

  if (!contentTypeDoc.exists) {
    throw new NotFoundError("Content type not found");
  }

  const contentTypeData = contentTypeDoc.data() as ContentType;
  if (!contentTypeData) {
    throw new NotFoundError("Content type data not found");
  }

  return {
    id: contentTypeDoc.id,
    ...contentTypeData,
  };
}

/**
 * Creates a new content type
 * @param contentTypeData The content type data
 * @param userId The ID of the user creating the content type
 * @returns The ID of the created content type
 */
export async function createContentType(
  contentTypeData: CreateContentTypeData,
  userId: string
): Promise<string> {
  const now = new Date().toISOString();

  const docRef = await db.collection("contentTypes").add({
    ...contentTypeData,
    isActive: contentTypeData.isActive !== undefined ? contentTypeData.isActive : true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  return docRef.id;
}

/**
 * Updates a content type
 * @param contentTypeId The content type ID to update
 * @param updateData The data to update
 * @param userId The ID of the user updating the content type
 * @returns Promise that resolves when the content type is updated
 * @throws UnauthorizedError if the user is not an admin
 */
export async function updateContentType(
  contentTypeId: string,
  updateData: Partial<ContentType>,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can update content types");
  }

  // Update the content type
  await db.collection("contentTypes").doc(contentTypeId).update({
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a content type
 * @param contentTypeId The content type ID to delete
 * @param userId The ID of the user deleting the content type
 * @returns Promise that resolves when the content type is deleted
 * @throws UnauthorizedError if the user is not an admin
 */
export async function deleteContentType(
  contentTypeId: string,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can delete content types");
  }

  // Delete the content type
  await db.collection("contentTypes").doc(contentTypeId).delete();
}
