import { db } from "@/lib/firebaseAdmin";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface MusicTrack {
  title: string;
  artist: string;
  duration: number;
  fileUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  genre: string;
  mood: string;
}

export interface CreateMusicTrackData {
  title: string;
  artist: string;
  duration: number;
  fileUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  genre?: string;
  mood?: string;
}

/**
 * Gets all music tracks
 * @returns Array of music tracks
 */
export async function getAllMusicTracks(): Promise<Array<MusicTrack & { id: string }>> {
  const snapshot = await db
    .collection("music")
    .where("isActive", "==", true)
    .orderBy("title")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as MusicTrack),
  }));
}

/**
 * Gets a music track by ID
 * @param trackId The track ID to fetch
 * @returns The music track data
 * @throws NotFoundError if the track doesn't exist
 */
export async function getMusicTrackById(trackId: string): Promise<MusicTrack & { id: string }> {
  const trackDoc = await db.collection("music").doc(trackId).get();

  if (!trackDoc.exists) {
    throw new NotFoundError("Music track not found");
  }

  const trackData = trackDoc.data() as MusicTrack;
  if (!trackData) {
    throw new NotFoundError("Music track data not found");
  }

  return {
    id: trackDoc.id,
    ...trackData,
  };
}

/**
 * Creates a new music track
 * @param trackData The track data
 * @param userId The ID of the user creating the track
 * @returns The ID of the created track
 * @throws UnauthorizedError if the user is not an admin
 */
export async function createMusicTrack(
  trackData: CreateMusicTrackData,
  userId: string
): Promise<string> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can create music tracks");
  }

  const now = new Date().toISOString();
  
  const docRef = await db.collection("music").add({
    ...trackData,
    thumbnailUrl: trackData.thumbnailUrl || "",
    tags: trackData.tags || [],
    genre: trackData.genre || "Unknown",
    mood: trackData.mood || "Neutral",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });

  return docRef.id;
}

/**
 * Updates a music track
 * @param trackId The track ID to update
 * @param updateData The data to update
 * @param userId The ID of the user updating the track
 * @returns Promise that resolves when the track is updated
 * @throws UnauthorizedError if the user is not an admin
 */
export async function updateMusicTrack(
  trackId: string,
  updateData: Partial<MusicTrack>,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can update music tracks");
  }

  // Update the track
  await db.collection("music").doc(trackId).update({
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a music track
 * @param trackId The track ID to delete
 * @param userId The ID of the user deleting the track
 * @returns Promise that resolves when the track is deleted
 * @throws UnauthorizedError if the user is not an admin
 */
export async function deleteMusicTrack(
  trackId: string,
  userId: string
): Promise<void> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can delete music tracks");
  }

  // Delete the track
  await db.collection("music").doc(trackId).delete();
}

/**
 * Uploads a music track file
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @returns The URL of the uploaded file
 * @throws UnauthorizedError if the user is not an admin
 */
export async function uploadMusicFile(
  file: File,
  userId: string
): Promise<string> {
  // Check if user is admin (this would be a more complex check in a real app)
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.isAdmin) {
    throw new UnauthorizedError("Only admins can upload music files");
  }

  // This would upload the file to a storage service in a real implementation
  const fileUrl = `https://example.com/music-${Date.now()}.mp3`;

  return fileUrl;
}