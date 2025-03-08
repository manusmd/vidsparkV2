import { onTaskDispatched } from "firebase-functions/tasks";
import Replicate from "replicate";
import { db } from "../../../firebaseConfig";
import { defineSecret } from "firebase-functions/params";

const REPLICATE_API_KEY = defineSecret("REPLICATE_API_KEY");

export const processImageQueue = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3 },
    rateLimits: { maxConcurrentDispatches: 2 },
    memory: "2GiB",
    secrets: [REPLICATE_API_KEY],
  },
  async (event) => {
    const { videoId, sceneIndex, imagePrompt } = event.data;
    if (!videoId || sceneIndex === undefined || !imagePrompt) {
      console.error("Missing parameters in image task payload");
      return;
    }
    const videoRef = db.collection("videos").doc(videoId);
    try {
      console.log(
        `🎨 Generating image for video ${videoId}, scene ${sceneIndex}`,
      );

      // Update status: set processing state and initial progress.
      await videoRef.update({
        [`imageStatus.${sceneIndex}.statusMessage`]: "processing",
        [`imageStatus.${sceneIndex}.progress`]: 0.1,
      });

      const replicate = new Replicate({ auth: REPLICATE_API_KEY.value() });
      const prediction = await replicate.predictions.create({
        version:
          "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
        input: {
          prompt: `${imagePrompt}. High quality, detailed, professional.`,
          negative_prompt:
            "blurry, low quality, distorted, deformed, ugly, bad anatomy",
          num_inference_steps: 30,
          scheduler: "DPMSolverMultistep",
          guidance_scale: 7,
          num_outputs: 1,
          width: 1080,
          height: 1920,
        },
      });

      let result = await replicate.predictions.get(prediction.id);
      let attempts = 0;
      const maxAttempts = 90;
      while (
        (result.status === "starting" || result.status === "processing") &&
        !result.output &&
        attempts < maxAttempts
      ) {
        await new Promise((res) => setTimeout(res, 2000));
        result = await replicate.predictions.get(prediction.id);
        attempts++;
        const progress = Math.min(0.1 + attempts * (0.9 / maxAttempts), 0.9);
        await videoRef.update({
          [`imageStatus.${sceneIndex}.progress`]: progress,
        });
        console.log(`🔄 Attempt ${attempts}: Status - ${result.status}`);
      }

      if (
        attempts >= maxAttempts ||
        result.status === "failed" ||
        result.error
      ) {
        console.error(
          `❌ Image generation failed for video ${videoId}, scene ${sceneIndex}`,
        );
        await videoRef.update({
          [`imageStatus.${sceneIndex}.statusMessage`]: "failed",
          [`imageStatus.${sceneIndex}.progress`]: 0,
        });
        return;
      }

      const imageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;
      const videoSnapshot = await videoRef.get();
      const currentScenes = videoSnapshot.data()?.scenes || {};
      await videoRef.update({
        scenes: {
          ...currentScenes,
          [sceneIndex]: { ...currentScenes[sceneIndex], imageUrl },
        },
        [`imageStatus.${sceneIndex}.statusMessage`]: "completed",
        [`imageStatus.${sceneIndex}.progress`]: 1,
      });
      console.log(
        `✅ Image generated for video ${videoId}, scene ${sceneIndex}`,
      );
    } catch (error: any) {
      console.error("❌ Image generation error:", error.message);
      await videoRef.update({
        [`imageStatus.${sceneIndex}.statusMessage`]: "failed",
        [`imageStatus.${sceneIndex}.progress`]: 0,
      });
      throw error;
    }
  },
);
