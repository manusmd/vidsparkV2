import { onTaskDispatched } from "firebase-functions/tasks";
import axios from "axios";
import FormData from "form-data";
import { defineSecret } from "firebase-functions/params";
import { db, storage } from "../../../firebaseConfig";

const ELEVENLABS_API_KEY = defineSecret("ELEVENLABS_API_KEY");

export const processVoiceQueue = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3 },
    rateLimits: { maxConcurrentDispatches: 1 },
    memory: "2GiB",
    secrets: [ELEVENLABS_API_KEY],
  },
  async (event) => {
    // Expected payload: { videoId, sceneIndex, narration, voiceId }
    const { videoId, sceneIndex, narration, voiceId } = event.data;
    if (!videoId || sceneIndex === undefined || !narration || !voiceId) {
      console.error("Missing parameters in voice task payload");
      return;
    }
    const videoRef = db.collection("videos").doc(videoId);
    try {
      console.log(
        `🎙 Generating voice for video ${videoId}, scene ${sceneIndex}`,
      );

      // Update status: set processing state and initial progress.
      await videoRef.update({
        [`voiceStatus.${sceneIndex}.statusMessage`]: "processing",
        [`voiceStatus.${sceneIndex}.progress`]: 0.1,
      });

      // Generate the voice audio via ElevenLabs TTS API.
      const ttsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: narration,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY.value(),
          },
          responseType: "arraybuffer",
        },
      );
      if (!ttsResponse.data) throw new Error("Failed to generate voice.");

      // Update progress mid-way.
      await videoRef.update({ [`voiceStatus.${sceneIndex}.progress`]: 0.5 });

      const audioBuffer = Buffer.from(ttsResponse.data);
      const filePath = `videos/${videoId}/scene_${sceneIndex}.mp3`;
      const fileRef = storage.file(filePath);
      await fileRef.save(audioBuffer, {
        metadata: { contentType: "audio/mpeg" },
      });
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Generate captions using ElevenLabs speech-to-text API.
      console.log(
        `🎤 Generating captions for video ${videoId}, scene ${sceneIndex}`,
      );
      const form = new FormData();
      form.append("model_id", "scribe_v1");
      form.append("file", audioBuffer, {
        filename: `scene_${sceneIndex}.mp3`,
        contentType: "audio/mpeg",
      });

      const sttResponse = await axios.post(
        "https://api.elevenlabs.io/v1/speech-to-text",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "xi-api-key": ELEVENLABS_API_KEY.value(),
          },
        },
      );
      // Expecting transcript text and words array in the response.
      const transcript = sttResponse.data?.text;
      const words = sttResponse.data?.words;
      if (!transcript || !words) {
        console.error("❌ Failed to generate transcript or words");
        throw new Error("Failed to generate transcript");
      }

      // Update the video document with the generated voice URL, transcript, and words.
      const videoSnapshot = await videoRef.get();
      const currentScenes = videoSnapshot.data()?.scenes || {};
      await videoRef.update({
        scenes: {
          ...currentScenes,
          [sceneIndex]: {
            ...currentScenes[sceneIndex],
            voiceUrl: signedUrl,
            captions: transcript,
            captionsWords: words,
          },
        },
        [`voiceStatus.${sceneIndex}.statusMessage`]: "completed",
        [`voiceStatus.${sceneIndex}.progress`]: 1,
      });
      console.log(
        `✅ Voice and captions generated for video ${videoId}, scene ${sceneIndex}`,
      );
    } catch (error: any) {
      console.error("❌ Voice generation error:", error.message);
      await videoRef.update({
        [`voiceStatus.${sceneIndex}.statusMessage`]: "failed",
        [`voiceStatus.${sceneIndex}.progress`]: 0,
      });
      throw error; // Let Cloud Tasks retry the task.
    }
  },
);
