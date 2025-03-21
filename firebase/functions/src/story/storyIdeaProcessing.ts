import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import { ChatOpenAI } from "@langchain/openai";
import { defineSecret } from "firebase-functions/params";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const processStoryIdea = onDocumentCreated(
  {
    document: "storyIdeas/{ideaId}",
    secrets: [OPENAI_API_KEY],
  },
  async (event) => {
    const ideaId = event.params.ideaId;
    console.log("Starting processing for story idea:", ideaId);

    const snapshot = event.data;
    if (!snapshot) {
      console.error("❌ No document data found in storyIdeas.");
      return;
    }
    const data = snapshot.data();

    if (!data.prompt) {
      console.error(`Story idea ${ideaId} does not contain a prompt.`);
      return;
    }
    if (data.status !== "pending") {
      console.log(
        `Story idea ${ideaId} is not pending. Current status: ${data.status}`,
      );
      return;
    }

    try {
      const model = new ChatOpenAI({
        apiKey: OPENAI_API_KEY.value(),
        model: "o3-mini",
      });

      const messages = [
        {
          role: "system",
          content:
            "Generate a short, creative narration text suitable for a YouTube Short video (around 1 minute in length) based on the given story idea.",
        },
        {
          role: "user",
          content: `Generate a creative narration for a YouTube Short (about 1 minute) for the following story idea: "${data.prompt}"`,
        },
      ];

      const response = await model.invoke(messages);
      const narration = response.content;
      console.log(`Generated narration for story idea ${ideaId}: ${narration}`);

      await db.collection("storyIdeas").doc(ideaId).update({
        narration,
        status: "completed",
      });
      console.log(`Story idea ${ideaId} updated successfully.`);
      return null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(
        `Error generating narration for story idea ${ideaId}: ${message}`,
      );
      await db.collection("storyIdeas").doc(ideaId).update({
        status: "error",
        error: message,
      });
      return null;
    }
  },
);
