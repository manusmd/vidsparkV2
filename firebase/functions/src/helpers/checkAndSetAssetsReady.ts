import { db } from "../../firebaseConfig";

/**
 * Checks if all scenes for a given video have completed their image and voice processing.
 * If so, updates the video's assets status to "assets:ready".
 *
 * @param videoId - The ID of the video to check.
 */
export async function checkAndSetAssetsReady(videoId: string): Promise<void> {
  const videoRef = db.collection("videos").doc(videoId);
  const videoSnapshot = await videoRef.get();
  const data = videoSnapshot.data() || {};
  const imageStatus = data.imageStatus || {};
  const voiceStatus = data.voiceStatus || {};

  const allImageDone = Object.values(imageStatus).every(
    (s: any) => s.statusMessage !== "processing",
  );
  const allVoiceDone = Object.values(voiceStatus).every(
    (s: any) => s.statusMessage !== "processing",
  );

  if (allImageDone && allVoiceDone) {
    await videoRef.update({ status: "assets:ready" });
    console.log(`🎉 All tasks completed for video ${videoId}: assets: ready`);
  }
}
