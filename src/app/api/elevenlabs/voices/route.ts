import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      throw new Error("Missing ElevenLabs API key");
    }

    console.log("Fetching ElevenLabs voices...");

    // Initialize the ElevenLabs SDK
    const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

    // Fetch voices using the SDK
    const voices = await elevenlabs.voices.getAll();

    console.log("Fetched voices:", voices);

    // Process voices and include preview URLs
    const processedVoices = voices.voices.map((voice) => ({
      id: voice.voice_id,
      name: voice.name,
      preview_url: voice.preview_url || null, // Ensure preview_url is included
      labels: {
        accent: voice.labels?.accent || "",
        age: voice.labels?.age || "",
        description: voice.labels?.description || "",
        gender: voice.labels?.gender || "",
        use_case: voice.labels?.use_case || "",
      },
    }));

    return NextResponse.json({ voices: processedVoices });
  } catch (error) {
    console.error("Error fetching ElevenLabs voices:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
