import OpenAI from "openai";

export async function retrieveHashtags(
  apiKey: string,
  narration: string,
): Promise<string> {
  const openaiClient = new OpenAI({ apiKey });
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
        content: `For a video with the following narration: "${narration}", list the top 10 trending hashtags that are relevant to its theme. Provide only the hashtags separated by spaces.`,
      },
    ],
  });

  const rawContent = (
    hashtagResponse.choices[0].message.content as string
  ).trim();

  const hashtags = rawContent.match(/#[\w]+/g);

  return hashtags ? hashtags.join(" ") : "";
}
