import { onTaskDispatched } from "firebase-functions/tasks";
import { db, functions } from "../../firebaseConfig";
import { checkAndSetAssetsReady } from "../helpers/checkAndSetAssetsReady";
import getFunctionUrl from "../helpers/getFunctionUrl";

export const syncVideoStatus = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 5 },
    rateLimits: { maxConcurrentDispatches: 1 },
    memory: "256MiB",
  },
  async (event) => {
    const { videoId } = event.data;
    if (!videoId) {
      console.error("Missing videoId in syncVideoStatus task payload");
      return;
    }
    console.log(`Checking asset readiness for video ${videoId}...`);
    await checkAndSetAssetsReady(videoId);
    const videoSnapshot = await db.collection("videos").doc(videoId).get();
    const data = videoSnapshot.data() || {};
    if (data.status !== "assets:ready") {
      console.log(
        `Video ${videoId} assets are not yet ready. Re-enqueuing sync task...`,
      );
      const syncQueue = functions.taskQueue("syncVideoStatus");
      const targetUri = await getFunctionUrl("syncVideoStatus", "us-central1");
      await syncQueue.enqueue(
        { videoId },
        { scheduleDelaySeconds: 5, uri: targetUri },
      );
      return;
    }
    console.log(`Video ${videoId} assets are now ready.`);
  },
);
