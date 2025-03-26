import { Configuration, OpenAIApi } from "openai";

// Define interfaces for type safety
export interface StoryRequest {
  topic: string;
  length?: number;
  tone?: string;
  audience?: string;
  additionalInstructions?: string;
}

export interface StoryIdea {
  topic: string;
  count?: number;
}

export interface StoryResponse {
  content: string;
  topic: string;
  metadata: {
    tokens: number;
    model: string;
    processingTime: number;
  };
}

export interface StoryIdeaResponse {
  ideas: string[];
  topic: string;
  metadata: {
    tokens: number;
    model: string;
    processingTime: number;
  };
}

/**
 * Initializes the OpenAI API client
 * @returns The OpenAI API client
 */
function initOpenAI(): OpenAIApi {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
}

/**
 * Generates a story based on the provided request
 * @param request The story request
 * @returns The generated story
 */
export async function generateStory(request: StoryRequest): Promise<StoryResponse> {
  const openai = initOpenAI();
  const startTime = Date.now();

  // Set defaults
  const length = request.length || 500;
  const tone = request.tone || "informative";
  const audience = request.audience || "general";
  const additionalInstructions = request.additionalInstructions || "";

  // Create the prompt
  const prompt = `
    Write a ${tone} story or article about "${request.topic}" for a ${audience} audience.
    The content should be approximately ${length} words.
    ${additionalInstructions}
    
    Make sure the content is engaging, well-structured, and provides value to the reader.
  `;

  // Call the OpenAI API
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: Math.min(4000, length * 2),
    temperature: 0.7,
  });

  const content = response.data.choices[0]?.text?.trim() || "";
  const tokens = response.data.usage?.total_tokens || 0;
  const processingTime = Date.now() - startTime;

  return {
    content,
    topic: request.topic,
    metadata: {
      tokens,
      model: "text-davinci-003",
      processingTime,
    },
  };
}

/**
 * Generates story ideas based on the provided topic
 * @param request The story idea request
 * @returns The generated story ideas
 */
export async function generateStoryIdeas(request: StoryIdea): Promise<StoryIdeaResponse> {
  const openai = initOpenAI();
  const startTime = Date.now();

  // Set defaults
  const count = request.count || 5;

  // Create the prompt
  const prompt = `
    Generate ${count} creative and engaging story ideas or article topics related to "${request.topic}".
    
    For each idea, provide a concise title or headline that would grab a reader's attention.
    Make the ideas diverse and interesting.
  `;

  // Call the OpenAI API
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 1000,
    temperature: 0.8,
  });

  const content = response.data.choices[0]?.text?.trim() || "";
  const tokens = response.data.usage?.total_tokens || 0;
  const processingTime = Date.now() - startTime;

  // Parse the ideas from the content
  const ideas = content
    .split(/\d+\./)
    .map((idea) => idea.trim())
    .filter((idea) => idea.length > 0);

  return {
    ideas,
    topic: request.topic,
    metadata: {
      tokens,
      model: "text-davinci-003",
      processingTime,
    },
  };
}