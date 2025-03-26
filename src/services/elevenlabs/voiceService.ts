import axios from "axios";

// Define interfaces for type safety
export interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  description?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

export interface TextToSpeechResponse {
  audio_url: string;
  metadata: {
    text_characters: number;
    processing_time: number;
    voice_id: string;
    model_id: string;
  };
}

/**
 * Gets all available voices from ElevenLabs
 * @returns Array of available voices
 */
export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices || [];
  } catch (error) {
    console.error("Error fetching voices from ElevenLabs:", error);
    throw new Error("Failed to fetch voices from ElevenLabs");
  }
}

/**
 * Gets a voice by ID
 * @param voiceId The voice ID to fetch
 * @returns The voice data
 */
export async function getVoiceById(voiceId: string): Promise<Voice> {
  try {
    const response = await axios.get(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching voice ${voiceId} from ElevenLabs:`, error);
    throw new Error(`Failed to fetch voice ${voiceId} from ElevenLabs`);
  }
}

/**
 * Converts text to speech using ElevenLabs
 * @param request The text-to-speech request
 * @returns The text-to-speech response
 */
export async function textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  const startTime = Date.now();

  try {
    // Set defaults
    const modelId = request.model_id || "eleven_monolingual_v1";
    const voiceSettings = request.voice_settings || {
      stability: 0.5,
      similarity_boost: 0.5,
    };

    // Call the ElevenLabs API
    // In a real implementation, we would use the response to get the audio data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${request.voice_id}`,
      {
        text: request.text,
        model_id: modelId,
        voice_settings: voiceSettings,
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // In a real implementation, we would upload this audio to a storage service
    // For this example, we'll just pretend we did that and return a fake URL
    const audioUrl = `https://example.com/audio-${Date.now()}.mp3`;

    const processingTime = Date.now() - startTime;

    return {
      audio_url: audioUrl,
      metadata: {
        text_characters: request.text.length,
        processing_time: processingTime,
        voice_id: request.voice_id,
        model_id: modelId,
      },
    };
  } catch (error) {
    console.error("Error converting text to speech with ElevenLabs:", error);
    throw new Error("Failed to convert text to speech with ElevenLabs");
  }
}
