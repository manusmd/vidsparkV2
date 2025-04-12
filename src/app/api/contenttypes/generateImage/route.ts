import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// AI image generation API for content types using Replicate's stability-ai/sdxl model
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const enhancedPrompt = `${prompt}, high quality, detailed, 8k, masterpiece`;
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: "low quality, blurry, distorted, deformed, disfigured, bad anatomy, watermark",
          width: 1024,
          height: 1024,
          scheduler: "K_EULER",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }
    );

    return NextResponse.json({ output });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
} 