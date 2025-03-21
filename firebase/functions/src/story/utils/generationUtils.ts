import { ChatOpenAI } from "@langchain/openai";
import { StorySchema } from "../../schemas/storySchema";

export async function generateStory(
  prompt: string,
  apiKey: string,
): Promise<any> {
  const generationModel = new ChatOpenAI({
    apiKey,
    model: "gpt-4",
  });
  const structuredLlm = generationModel.withStructuredOutput(StorySchema, {
    method: "json_mode",
    name: "story",
  });
  const generationMessages = [
    {
      role: "system",
      content:
        "Follow the instructions exactly. Output must be valid JSON matching the provided schema.",
    },
    { role: "user", content: prompt },
  ];
  return await structuredLlm.invoke(generationMessages);
}
