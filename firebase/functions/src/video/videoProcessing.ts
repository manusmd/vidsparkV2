import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db, functions } from "../../firebaseConfig";
import getFunctionUrl from "../helpers/getFunctionUrl";

export const processVideoQueue = onDocumentCreated(
  "pendingVideos/{pendingVideoId}",
  async (event) => {
    const pendingVideoId = event.params.pendingVideoId;
    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found.");
      return;
    }
    const data = snapshot.data();
    const videoId = data.videoId;
    if (!videoId) {
      console.error("❌ Missing videoId in pendingVideos document.");
      return;
    }

    const videoRef = db.collection("videos").doc(videoId);
    const videoSnapshot = await videoRef.get();
    if (!videoSnapshot.exists) {
      console.error(`❌ Video not found: ${videoId}`);
      return;
    }
    const videoData = videoSnapshot.data();
    if (!videoData?.scenes || Object.keys(videoData.scenes).length === 0) {
      console.error(`❌ No scenes found for video: ${videoId}`);
      return;
    }

    console.log(`🔊 Processing tasks for video: ${videoId}`);
    await videoRef.update({ status: "processing:assets" });

    // Enqueue voice tasks.
    const voiceQueue = functions.taskQueue("voiceQueue");
    const voiceTargetUri = await getFunctionUrl("voiceQueue", "us-central1");
    console.log("Voice target URI:", voiceTargetUri);
    const voiceEnqueues = [];
    for (const sceneIndex of Object.keys(videoData.scenes)) {
      const payload = {
        videoId,
        sceneIndex: Number(sceneIndex),
        narration: videoData.scenes[sceneIndex].narration,
        voiceId: videoData.voiceId,
        status: "pending",
        createdAt: new Date(),
      };
      console.log("Enqueuing voice task for scene:", sceneIndex, payload);
      voiceEnqueues.push(voiceQueue.enqueue(payload, { uri: voiceTargetUri }));
    }
    await Promise.all(voiceEnqueues);
    console.log("Voice tasks enqueued.");

    // Enqueue image tasks.
    const imageQueue = functions.taskQueue("imageQueue");
    const imageTargetUri = await getFunctionUrl("imageQueue", "us-central1");
    console.log("Image target URI:", imageTargetUri);
    const imageEnqueues = [];
    for (const sceneIndex of Object.keys(videoData.scenes)) {
      const scene = videoData.scenes[sceneIndex];
      const payload = {
        videoId,
        sceneIndex: Number(sceneIndex),
        imagePrompt: scene.imagePrompt,
        status: "pending",
        createdAt: new Date(),
      };
      console.log("Enqueuing image task for scene:", sceneIndex, payload);
      imageEnqueues.push(imageQueue.enqueue(payload, { uri: imageTargetUri }));
    }
    await Promise.all(imageEnqueues);
    console.log("Image tasks enqueued.");

    // Enqueue sync task to check asset readiness.
    const syncQueue = functions.taskQueue("syncVideoStatus");
    await syncQueue.enqueue({ videoId });
    console.log(`Enqueued syncVideoStatus task for video: ${videoId}`);

    // Delete the pendingVideos document to prevent re-triggering.
    await db.collection("pendingVideos").doc(pendingVideoId).delete();
    console.log(`Deleted pendingVideos document for video: ${videoId}`);
  },
);
