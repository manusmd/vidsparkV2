import { z } from "zod";

export const StorySchema = z.object({
  title: z.string(),
  description: z.string(),
  scenes: z.array(
    z.object({
      narration: z.string(),
      imagePrompt: z.string(),
    }),
  ),
});
