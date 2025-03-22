import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import {
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda-client";
import { defineSecret } from "firebase-functions/params";
import { AwsRegion } from "@remotion/lambda";

const REMOTION_AWS_LAMBDA_FUNCTION_NAME = defineSecret(
  "REMOTION_AWS_LAMBDA_FUNCTION_NAME",
);
const REMOTION_AWS_LAMBDA_REGION = defineSecret("REMOTION_AWS_LAMBDA_REGION");
const REMOTION_AWS_SERVE_URL = defineSecret("REMOTION_AWS_SERVE_URL");
const REMOTION_AWS_ACCESS_KEY_ID = defineSecret("REMOTION_AWS_ACCESS_KEY_ID");
const REMOTION_AWS_SECRET_ACCESS_KEY = defineSecret(
  "REMOTION_AWS_SECRET_ACCESS_KEY",
);

export const processVideoRender = onDocumentCreated(
  {
    document: "videoRenderQueue/{queueId}",
    timeoutSeconds: 540,
    secrets: [
      REMOTION_AWS_LAMBDA_FUNCTION_NAME,
      REMOTION_AWS_LAMBDA_REGION,
      REMOTION_AWS_SERVE_URL,
      REMOTION_AWS_ACCESS_KEY_ID,
      REMOTION_AWS_SECRET_ACCESS_KEY,
    ],
    // retry: false, // Optionally disable automatic retries
  },
  async (event) => {
    const queueId = event.params.queueId;
    console.log(`Processing queue document: ${queueId}`);
    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found in videoRenderQueue.");
      return;
    }
    const data = snapshot.data();
    console.log(`Queue document data: ${JSON.stringify(data)}`);
    if (data.processed) {
      console.log(
        `Queue document ${queueId} has already been processed. Exiting.`,
      );
      return;
    }
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
      renderStatus: { progress: 0, videoUrl: null, statusMessage: "rendering" },
    });

    // Mark the document as processed immediately.
    await snapshot.ref.update({ processed: true });
    console.log(`Marked queue document ${queueId} as processed.`);

    const lambdaFunctionName = REMOTION_AWS_LAMBDA_FUNCTION_NAME.value();
    const lambdaRegion = REMOTION_AWS_LAMBDA_REGION.value() as AwsRegion;
    const serveUrl = REMOTION_AWS_SERVE_URL.value();
    if (!lambdaFunctionName) {
      console.error("❌ REMOTION_AWS_LAMBDA_FUNCTION_NAME not provided");
      return;
    }
    if (!serveUrl) {
      console.error("❌ REMOTION_AWS_SERVE_URL not provided");
      return;
    }
    console.log("Using AWS Lambda function:", lambdaFunctionName);
    console.log("Lambda region:", lambdaRegion);
    console.log("Serve URL:", serveUrl);

    try {
      const lambdaResult = await renderMediaOnLambda({
        envVariables: {
          REMOTION_AWS_ACCESS_KEY_ID: REMOTION_AWS_ACCESS_KEY_ID.value(),
          REMOTION_AWS_SECRET_ACCESS_KEY:
            REMOTION_AWS_SECRET_ACCESS_KEY.value(),
        },
        region: lambdaRegion,
        functionName: lambdaFunctionName,
        serveUrl,
        composition: "VideoComposition",
        inputProps: {
          scenes: videoData.scenes,
          styling: videoData.styling,
          musicVolume: videoData.musicVolume
            ? parseFloat(videoData.musicVolume)
            : 0,
          musicUrl: videoData.musicUrl || null,
        },
        codec: "h264",
      });
      console.log("Lambda render initiated:", lambdaResult);

      const { renderId, bucketName } = lambdaResult;
      if (!renderId || !bucketName) {
        console.error(
          "❌ Render initiation failed. Missing renderId or bucketName.",
        );
        await videoRef.update({
          status: "render:error",
          renderStatus: {
            error: "Missing renderId or bucketName",
            statusMessage: "error",
          },
        });
        return;
      }

      // Poll for progress using getRenderProgress.
      let progressData;
      let pollCount = 0;
      do {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        progressData = await getRenderProgress({
          renderId,
          bucketName,
          functionName: lambdaFunctionName,
          region: lambdaRegion,
        });
        pollCount++;
        console.log(
          `Poll ${pollCount}: overallProgress for video ${videoId}: ${progressData.overallProgress}`,
        );
        await videoRef.update({
          "renderStatus.progress": progressData.overallProgress,
          "renderStatus.statusMessage": progressData.done
            ? "completed"
            : "rendering",
        });
      } while (!progressData.done && pollCount < 200);

      if (progressData.done) {
        console.log("Render completed for video", videoId);
        await videoRef.update({
          status: "render:complete",
          renderStatus: {
            progress: 1,
            videoUrl: progressData.outputFile || null,
            statusMessage: "completed",
          },
        });
      } else {
        console.error("Render did not complete in expected time.");
        await videoRef.update({
          status: "render:error",
          renderStatus: {
            error: "Render timed out",
            statusMessage: "error",
          },
        });
      }
    } catch (err: any) {
      console.error("Error rendering video on AWS Lambda:", err);
      await videoRef.update({
        status: "render:error",
        renderStatus: {
          error: err.message || "Unknown error",
          statusMessage: "error",
        },
      });
    }
    try {
      await db.collection("videoRenderQueue").doc(queueId).delete();
      console.log(`Deleted videoRenderQueue document for video: ${videoId}`);
    } catch (deleteError) {
      console.error(
        `❌ Failed to delete videoRenderQueue document ${queueId}:`,
        deleteError,
      );
    }
  },
);
