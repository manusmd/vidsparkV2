import { NextResponse } from "next/server";
import Replicate from "replicate";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

// AI image generation API using Replicate's stability-ai/sdxl model
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }
    
    const replicate = new Replicate({ auth: REPLICATE_API_KEY! });

    const prediction = await replicate.predictions.create({
      version:
        "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
      input: {
        prompt: prompt,
        negative_prompt:
          "blurry, low quality, distorted, deformed, ugly, bad anatomy",
        num_inference_steps: 30,
        scheduler: "DPMSolverMultistep",
        guidance_scale: 7,
        num_outputs: 1,
        width: 1080,
        height: 1080, // Changed height to 1080 for a 1:1 aspect ratio
      },
    });

    await new Promise((res) => setTimeout(res, 2000));

    let result = await replicate.predictions.get(prediction.id);
    let attempts = 0;
    const maxAttempts = 90;

    while (
      (result.status === "starting" || result.status === "processing") &&
      !result.output &&
      attempts < maxAttempts
    ) {
      await new Promise((res) => setTimeout(res, 2000));
      result = await replicate.predictions.get(prediction.id);
      attempts++;
    }

    const rawImageUrl = Array.isArray(result.output)
      ? result.output[0]
      : result.output;

    return NextResponse.json({ imageUrl: rawImageUrl });
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    const message = 
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 