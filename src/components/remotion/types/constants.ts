import { z } from "zod";

export const TextDesignSchema = z.object({
  variant: z
    .enum([
      "default",
      "cool",
      "retro",
      "classic",
      "vivid",
      "fancy",
      "comic",
      "tiktok",
      "horror",
      "futuristic",
    ])
    .optional(),
  font: z
    .enum(["roboto", "lato", "caveat", "playfair", "dancingScript"])
    .optional(),
});
export const CompositionProps = z.object({
  scenes: z.record(
    z.object({
      narration: z.string(),
      imagePrompt: z.string(),
    }),
  ),
  styling: TextDesignSchema,
  musicVolume: z.number(),
  musicUrl: z.string().nullable(),
});
