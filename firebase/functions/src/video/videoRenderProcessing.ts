import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import { getServices, renderMediaOnCloudrun } from "@remotion/cloudrun/client";
import { GcpRegion } from "@remotion/cloudrun";
import { defineSecret } from "firebase-functions/params";

const REMOTION_CLOUDRUN_REGION = defineSecret("REMOTION_CLOUDRUN_REGION");
const REMOTION_CLOUDRUN_SERVE_URL = defineSecret("REMOTION_CLOUDRUN_SERVE_URL");
const REMOTION_CLOUDRUN_SERVICE_NAME = defineSecret(
  "REMOTION_CLOUDRUN_SERVICE_NAME",
);

export const processVideoRender = onDocumentCreated(
  {
    document: "videoRenderQueue/{queueId}",
    timeoutSeconds: 1000,
    secrets: [
      REMOTION_CLOUDRUN_REGION,
      REMOTION_CLOUDRUN_SERVE_URL,
      REMOTION_CLOUDRUN_SERVICE_NAME,
    ],
  },
  async (event) => {
    const queueId = event.params.queueId;
    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found in videoRenderQueue.");
      return;
    }
    const data = snapshot.data();
    const videoId = data.videoId;
    if (!videoId) {
      console.error("❌ Missing videoId in videoRenderQueue document.");
      return;
    }

    const videoRef = db.collection("videos").doc(videoId);
    const videoSnapshot = await videoRef.get();
    if (!videoSnapshot.exists) {
      console.error(`❌ Video not found: ${videoId}`);
      return;
    }
    const videoData = videoSnapshot.data();
    if (!videoData) {
      console.error(`❌ Video data is empty: ${videoId}`);
      return;
    }
    if (!videoData.scenes || Object.keys(videoData.scenes).length === 0) {
      console.error(`❌ No scenes found for video: ${videoId}`);
      return;
    }

    console.log(`🔊 Starting render for video: ${videoId}`);
    await videoRef.update({
      status: "processing:render",
      renderStatus: { progress: 0, videoUrl: null },
    });

    const region: GcpRegion = REMOTION_CLOUDRUN_REGION.value() as GcpRegion;
    const serveUrl = REMOTION_CLOUDRUN_SERVE_URL.value();
    if (!serveUrl) {
      console.error("❌ REMOTION_CLOUDRUN_SERVE_URL not provided");
      return;
    }
    let serviceName = REMOTION_CLOUDRUN_SERVICE_NAME.value();
    if (!serviceName) {
      const services = await getServices({ region, compatibleOnly: true });
      if (services.length === 0) {
        console.error("❌ No compatible Cloud Run service found");
        return;
      }
      serviceName = services[0].serviceName;
    }
    if (!serviceName) {
      console.error("❌ No compatible Cloud Run service found");
      return;
    }
    console.log("Using Cloud Run service:", serviceName);

    try {
      const result = await renderMediaOnCloudrun({
        serviceName,
        region,
        serveUrl,
        composition: "VideoComposition",
        inputProps: {
          scenes: videoData.scenes,
          styling: videoData.styling,
        },
        codec: "h264",
        updateRenderProgress: async (progress: number) => {
          console.log(`Render progress for video ${videoId}: ${progress}`);
          await videoRef.update({ "renderStatus.progress": progress });
        },
      });

      if (result.type === "success") {
        console.log("Render completed for video", videoId);
        await videoRef.update({
          status: "render:complete",
          renderStatus: {
            progress: 1,
            videoUrl: result.publicUrl || null,
            renderId: result.renderId,
            bucketName: result.bucketName,
          },
        });
      } else {
        console.error("Render crashed:", result.message);
        await videoRef.update({
          status: "render:error",
          renderStatus: { error: result.message },
        });
      }
    } catch (err: any) {
      console.error("Error rendering video on Cloud Run:", err);
      await videoRef.update({
        status: "render:error",
        renderStatus: { error: err.message || "Unknown error" },
      });
    }
    // Delete the queue document to prevent re-triggering.
    await db.collection("videoRenderQueue").doc(queueId).delete();
    console.log(`Deleted videoRenderQueue document for video: ${videoId}`);
  },
);
