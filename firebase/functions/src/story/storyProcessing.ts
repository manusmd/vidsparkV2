import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import OpenAI from "openai";
import { defineSecret } from "firebase-functions/params";

const StorySchema = z.object({
  title: z.string(),
  description: z.string(),
  scenes: z.array(
    z.object({
      narration: z.string(),
      imagePrompt: z.string(),
    }),
  ),
});

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const processVideoStory = onDocumentCreated(
  {
    document: "videos/{videoId}",
    secrets: [OPENAI_API_KEY],
  },

  async (event) => {
    const videoId = event.params.videoId;
    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found.");
      return;
    }
    const data = snapshot.data();
    // Only process if the video status is "processing:story"
    if (data.status !== "processing:story") {
      console.log(`Video ${videoId} not in processing:story status.`);
      return;
    }

    const { contentType, customPrompt } = data;

    try {
      // --- Reasoning Step ---
      const reasoningModel = new ChatOpenAI({
        apiKey: OPENAI_API_KEY.value(),
        model: "o3-mini",
      });
      const reasoningMessages = [
        {
          role: "system",
          content: `You are an expert in storytelling. Plan the optimal narrative structure for a short-form video story that:
- Contains exactly between 3 and 5 scenes.
- Has a total duration of no more than 1 minute.
- Begins with a very strong hook.
For each scene, outline:
- The exact narration text that a narrator would say aloud.
- An extremely detailed image prompt specifying visual composition, lighting, mood, style, and specific elements for realism.
Ensure that in the final scene, the narration includes a call-to-action (e.g., "For more stories like this follow our channel"), adapted to match the context.
Provide a concise reasoning summary that includes the exact number of scenes and a rough duration per scene.`,
        },
        {
          role: "user",
          content: `Plan the structure for a story about ${customPrompt ? "the following content" : contentType}${customPrompt ? ` with the custom prompt: "${customPrompt}"` : ""}.`,
        },
      ];
      const reasoningResponse = await reasoningModel.invoke(reasoningMessages);
      const chainOfThought = reasoningResponse.content;

      // --- Generation Step ---
      const generationModel = new ChatOpenAI({
        apiKey: OPENAI_API_KEY.value(),
        model: "gpt-4",
      });
      const structuredLlm = generationModel.withStructuredOutput(StorySchema, {
        method: "json_mode",
        name: "story",
      });
      const generationMessages = [
        {
          role: "system",
          content: `You are a professional storyteller. Use the following internal reasoning as guidance to generate a creative story that strictly contains between 3 and 5 scenes and lasts no more than 1 minute.
Ensure:
- The first scene contains a very strong hook that immediately grabs attention.
- The narration in each scene is the exact spoken text a narrator would say aloud.
- The final scene includes a clear, context-appropriate call-to-action.
- For each scene, provide:
  * "narration": the spoken text.
  * "imagePrompt": an extremely detailed image prompt specifying visual composition, lighting, mood, style, and specific elements.
Also, generate the video description exactly in the following format (without any extra text):
<Description text> (include at least one smiley)

For more stories like this follow our channel

<Hashtags>
Where <Hashtags> is a space-separated list of exactly 10 hashtags.
Internal reasoning: ${chainOfThought}`,
        },
        {
          role: "user",
          content: `Generate a structured AI story about ${customPrompt ? "the following content" : contentType}${customPrompt ? ` with the custom prompt: "${customPrompt}"` : ""}. Ensure the final JSON output has exactly between 3 and 5 scenes, spoken narration, a total duration of no more than 1 minute, and a description in the required three-part format.`,
        },
      ];
      const story = await structuredLlm.invoke(generationMessages);

      // --- Hashtag Retrieval ---
      const openaiClient = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });
      const hashtagResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o-search-preview",
        // @ts-ignore
        web_search_options: {
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            approximate: { country: "US", city: "New York", region: "NY" },
          },
        },
        messages: [
          {
            role: "user",
            content: `For a ${customPrompt ? customPrompt : contentType} video on YouTube focused on ${customPrompt ? customPrompt : contentType}, what are the top 10 trending hashtags relevant to this theme? Please provide only the hashtags separated by spaces, with no additional text.`,
          },
        ],
      });
      const hashtagsLine = (
        hashtagResponse.choices[0].message.content as string
      ).trim();

      // Format the description: use the first line as the description text, then a blank line, then the hashtags.
      const descriptionParts = (story.description as string)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const descriptionText = descriptionParts[0];
      story.description = `${descriptionText}\n\n${hashtagsLine}`;

      // Prepare scenes object.
      const scenes: { [sceneIndex: number]: any } = {};
      const sceneStatus: { [sceneIndex: number]: any } = {};
      const imageStatus: { [sceneIndex: number]: any } = {};
      const voiceStatus: { [sceneIndex: number]: any } = {};
      story.scenes.forEach((scene: any, index: number) => {
        scenes[index] = {
          narration: scene.narration,
          imagePrompt: scene.imagePrompt,
          imageUrl: "",
          voiceUrl: "",
          captions: "",
          captionsWords: [],
        };
        sceneStatus[index] = { statusMessage: "pending", progress: 0 };
        imageStatus[index] = { statusMessage: "pending", progress: 0 };
        voiceStatus[index] = { statusMessage: "pending", progress: 0 };
      });

      // Update the video document with the generated story and set status to "draft".
      await db.collection("videos").doc(videoId).update({
        title: story.title,
        description: story.description,
        scenes,
        sceneStatus,
        imageStatus,
        voiceStatus,
        status: "draft",
      });
      return null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error generating story:", message);
      await db.collection("videos").doc(event.params.videoId).update({
        status: "error",
        error: message,
      });
      return null;
    }
  },
);
