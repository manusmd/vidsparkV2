// checkAndSetSceneStatus.ts
import { db } from "../../firebaseConfig";

/**
 * Checks if both image and voice tasks for a scene are no longer processing.
 * If so, updates the sceneStatus for the scene.
 *
 * @param videoId - The ID of the video.
 * @param sceneIndex - The index of the scene.
 */
export async function checkAndSetSceneStatus(
  videoId: string,
  sceneIndex: number,
): Promise<void> {
  const videoRef = db.collection("videos").doc(videoId);
  const videoSnapshot = await videoRef.get();
  const data = videoSnapshot.data() || {};

  const imageStatus = data.imageStatus?.[sceneIndex]?.statusMessage;
  const voiceStatus = data.voiceStatus?.[sceneIndex]?.statusMessage;

  // If either task is still processing, do nothing.
  if (imageStatus === "processing" || voiceStatus === "processing") {
    return;
  }

  // Determine the overall scene status:
  // If either task failed then mark the scene as "failed"
  const newSceneStatus =
    imageStatus === "failed" || voiceStatus === "failed"
      ? "failed"
      : "completed";

  // Update the sceneStatus field for the given scene.
  await videoRef.update({
    [`sceneStatus.${sceneIndex}.statusMessage`]: newSceneStatus,
    [`sceneStatus.${sceneIndex}.progress`]: 1,
  });

  console.log(
    `Scene ${sceneIndex} for video ${videoId} updated to ${newSceneStatus}`,
  );
}
