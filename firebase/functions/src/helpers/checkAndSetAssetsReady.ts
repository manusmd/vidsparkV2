import { db } from "../../firebaseConfig";

/**
 * Checks if all scenes for a given video have completed their image and voice processing.
 * When each scene's imageStatus and voiceStatus are either "completed" or "failed" (and their updatedAt
 * timestamp is at least thresholdMs old), the video's status is updated to "assets:ready".
 *
 * @param videoId - The ID of the video to check.
 * @param thresholdMs - The minimum time in milliseconds since the last update for each scene to be considered stable.
 */
export async function checkAndSetAssetsReady(
  videoId: string,
  thresholdMs: number = 5000,
): Promise<void> {
  const videoRef = db.collection("videos").doc(videoId);
  const videoSnapshot = await videoRef.get();
  const data = videoSnapshot.data() || {};

  const scenes = data.scenes || {};
  const sceneCount = Object.keys(scenes).length;
  const imageStatus = data.imageStatus || {};
  const voiceStatus = data.voiceStatus || {};

  const now = Date.now();

  const allImageDone =
    Object.keys(imageStatus).length === sceneCount &&
    (
      Object.values(imageStatus) as Array<{
        statusMessage: string;
        updatedAt?: number;
      }>
    ).every(
      (s) =>
        (s.statusMessage === "completed" || s.statusMessage === "failed") &&
        s.updatedAt !== undefined &&
        now - s.updatedAt >= thresholdMs,
    );

  const allVoiceDone =
    Object.keys(voiceStatus).length === sceneCount &&
    (
      Object.values(voiceStatus) as Array<{
        statusMessage: string;
        updatedAt?: number;
      }>
    ).every(
      (s) =>
        (s.statusMessage === "completed" || s.statusMessage === "failed") &&
        s.updatedAt !== undefined &&
        now - s.updatedAt >= thresholdMs,
    );

  if (allImageDone && allVoiceDone) {
    await videoRef.update({ status: "assets:ready" });
    console.log(`🎉 All tasks completed for video ${videoId}: assets: ready`);
  } else {
    console.log(
      `Assets not ready for video ${videoId}: total scenes=${sceneCount}, images processed=${Object.keys(imageStatus).length}, voices processed=${Object.keys(voiceStatus).length}.`,
    );
  }
}
