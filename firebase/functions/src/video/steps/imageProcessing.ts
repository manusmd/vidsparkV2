import { onTaskDispatched } from "firebase-functions/tasks";
import Replicate from "replicate";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";
import { db, storage } from "../../../firebaseConfig";
import { checkAndSetSceneStatus } from "../../helpers/checkAndSetSceneStatus";

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
      // Update status for image processing with a timestamp.
      await videoRef.update({
        [`imageStatus.${sceneIndex}.statusMessage`]: "processing",
        [`imageStatus.${sceneIndex}.progress`]: 0.1,
        [`imageStatus.${sceneIndex}.updatedAt`]: Date.now(),
      });

      const replicate = new Replicate({ auth: REPLICATE_API_KEY.value() });
      const model = "black-forest-labs/flux-schnell";
      const currentPrompt = `${imagePrompt} The image shouldn't contain text.`;

      // Initiate the prediction.
      const prediction = await replicate.predictions.create({
        model,
        input: {
          prompt: currentPrompt,
          seed: Math.floor(Math.random() * 1000000),
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 80,
          num_inference_steps: 4,
          disable_safety_checker: false,
        },
      });

      let result = await replicate.predictions.get(prediction.id);
      let pollAttempts = 0;
      const maxPollAttempts = 90;
      while (
        (result.status === "starting" || result.status === "processing") &&
        !result.output &&
        pollAttempts < maxPollAttempts
      ) {
        await new Promise((res) => setTimeout(res, 2000));
        result = await replicate.predictions.get(prediction.id);
        pollAttempts++;
        const progress = Math.min(
          0.1 + (pollAttempts * 0.9) / maxPollAttempts,
          0.9,
        );
        await videoRef.update({
          [`imageStatus.${sceneIndex}.progress`]: progress,
          [`imageStatus.${sceneIndex}.updatedAt`]: Date.now(),
        });
        console.log(`🔄 Poll ${pollAttempts}: Status - ${result.status}`);
      }

      if (
        pollAttempts >= maxPollAttempts ||
        result.status === "failed" ||
        result.error
      ) {
        console.error(
          `❌ Image generation failed for video ${videoId}, scene ${sceneIndex}`,
        );
        await videoRef.update({
          [`imageStatus.${sceneIndex}.statusMessage`]: "failed",
          [`imageStatus.${sceneIndex}.progress`]: 0,
          [`imageStatus.${sceneIndex}.updatedAt`]: Date.now(),
        });
        return;
      }

      const rawImageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;
      const imageResponse = await axios.get(rawImageUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(imageResponse.data);

      const filePath = `videos/${videoId}/scene_${sceneIndex}.jpg`;
      const fileRef = storage.file(filePath);
      await fileRef.save(imageBuffer, {
        metadata: { 
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000"
        },
      });
      
      // Get the download URL using the proper Firebase Storage format
      const downloadUrl = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future date
      });

      const videoSnapshot = await videoRef.get();
      const currentScenes = videoSnapshot.data()?.scenes || {};

      await videoRef.update({
        scenes: {
          ...currentScenes,
          [sceneIndex]: {
            ...currentScenes[sceneIndex],
            imageUrl: downloadUrl[0],
          },
        },
        [`imageStatus.${sceneIndex}.statusMessage`]: "completed",
        [`imageStatus.${sceneIndex}.progress`]: 1,
        [`imageStatus.${sceneIndex}.updatedAt`]: Date.now(),
      });

      // Verify that the imageUrl was updated in Firestore; retry if necessary.
      let checkAttempts = 0;
      const maxCheckAttempts = 10;
      while (checkAttempts < maxCheckAttempts) {
        const updatedSnapshot = await videoRef.get();
        const updatedScenes = updatedSnapshot.data()?.scenes || {};
        if (updatedScenes[sceneIndex]?.imageUrl) {
          console.log(
            `Image URL verified for video ${videoId}, scene ${sceneIndex}`,
          );
          break;
        } else {
          checkAttempts++;
          console.warn(
            `Image URL missing for video ${videoId}, scene ${sceneIndex} on attempt ${checkAttempts}. Retrying update.`,
          );
          await videoRef.update({
            scenes: {
              ...updatedScenes,
              [sceneIndex]: {
                ...updatedScenes[sceneIndex],
                imageUrl: downloadUrl[0],
              },
            },
          });
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (checkAttempts === maxCheckAttempts) {
            console.error(
              `Failed to verify image URL for video ${videoId}, scene ${sceneIndex} after ${maxCheckAttempts} attempts.`,
            );
          }
        }
      }

      console.log(
        `✅ Image generated for video ${videoId}, scene ${sceneIndex}`,
      );
    } catch (error: any) {
      console.error("❌ Image generation error:", error.message);
      await videoRef.update({
        [`imageStatus.${sceneIndex}.statusMessage`]: "failed",
        [`imageStatus.${sceneIndex}.progress`]: 0,
        [`imageStatus.${sceneIndex}.updatedAt`]: Date.now(),
      });
      throw error;
    }

    await checkAndSetSceneStatus(videoId, sceneIndex);
  },
);
