import { StorySchema } from "../../schemas/storySchema";

export function buildGenerationPrompt(
  narration: string,
  imageType?: string,
): string {
  const styleInstruction = imageType
    ? `\n• IMPORTANT: For every scene's image prompt, integrate the style details: "${imageType}".`
    : "";
  return `
You are a professional storyteller.
Using the provided narration below, generate a structured story that splits the narration into exactly 3 to 5 scenes and lasts under 1 minute.

Requirements:
- The story must have a title, a video description, and an array of scenes.
- Each scene must contain:
    "narration": a segment of the provided narration text,
    "imagePrompt": a detailed prompt that includes lighting, mood, style, and realism.${styleInstruction}

Also, output a video description in this exact format (no extra text):
<Description text> (include at least one smiley)

The narration is:
"${narration}"

Return the result as valid JSON matching this schema:
${JSON.stringify(StorySchema.shape, null, 2)}
`;
}
