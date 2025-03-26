import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import { OPENAI_API_KEY } from "../secrets";
import { buildGenerationPrompt } from "./utils/promptUtils";
import { generateStory } from "./utils/generationUtils";
import { retrieveHashtags } from "./utils/hashtagUtils";
import { formatDescription } from "./utils/formatUtils";
import { prepareScenes } from "./utils/sceneUtils";

export const processStoryRequest = onDocumentCreated(
  {
    document: "storyRequest/{requestId}",
    secrets: [OPENAI_API_KEY],
  },
  async (event) => {
    const openaiApiKey = OPENAI_API_KEY.value();
    const requestId = event.params.requestId;
    console.log("Starting processing for story request:", requestId);

    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found in storyRequest.");
      return;
    }
    const data = snapshot.data();
    if (!data.narration) {
      console.error(`Story request ${requestId} missing narration.`);
      return;
    }
    console.log("Data retrieved for story request:", requestId);

    const { narration, imageType, videoId } = data;
    if (!videoId) {
      console.error(`Story request ${requestId} missing videoId.`);
      return;
    }

    try {
      // Build generation prompt.
      const prompt = buildGenerationPrompt(narration, imageType);
      console.log("Generation prompt:", prompt);

      // Generate structured story.
      const story = await generateStory(prompt, openaiApiKey);
      console.log("Generated story:", JSON.stringify(story, null, 2));

      // Retrieve hashtags.
      const hashtagsLine = await retrieveHashtags(openaiApiKey, narration);
      console.log("Retrieved hashtags:", hashtagsLine);

      // Format description.
      const formattedDescription = formatDescription(
        story.description,
        hashtagsLine,
      );
      story.description = formattedDescription;
      console.log("Formatted description:", formattedDescription);

      // Prepare scenes and associated status objects.
      const {
        scenes,
        sceneStatus,
        imageStatus: imgStatus,
        voiceStatus,
      } = prepareScenes(story.scenes);
      console.log("Prepared scenes:", JSON.stringify(scenes, null, 2));

      // Update the corresponding video document.
      await db
        .collection("videos")
        .doc(videoId)
        .update({
          title: story.title,
          description: story.description,
          scenes,
          sceneStatus,
          imageStatus: imgStatus,
          voiceStatus,
          status: "draft",
          imageType: data.imageType || "",
        });
      console.log("Video document updated successfully for video:", videoId);

      // Remove the processed storyRequest document.
      await db.collection("storyRequest").doc(requestId).delete();
      console.log("Deleted storyRequest document for request:", requestId);
      return null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error generating full story structure:", message);
      await db.collection("storyRequest").doc(requestId).update({
        status: "error",
        error: message,
      });
      return null;
    }
  },
);
