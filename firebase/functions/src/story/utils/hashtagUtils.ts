import OpenAI from "openai";

export async function retrieveHashtags(apiKey: string): Promise<string> {
  const openaiClient = new OpenAI({
    apiKey,
  });
  const hashtagResponse = await openaiClient.chat.completions.create({
    model: "gpt-4o-search-preview",
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
        content:
          "For a video based on the provided narration, list the top 10 trending hashtags relevant to this theme. Provide only the hashtags separated by spaces.",
      },
    ],
  });
  return (hashtagResponse.choices[0].message.content as string).trim();
}