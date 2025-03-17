import { TikTokPage } from "@remotion/captions";
import { z } from "zod";
import { TextDesignSchema } from "@/components/remotion/types/constants";

export type Step = {
  id: string;
  name: string;
  status: "current" | "complete" | "upcoming" | "failed"; // Ensures explicit progress tracking
  message?: string; // General message for this step
  subSteps?: {
    index: number;
    scene: number;
    status: "pending" | "processing" | "completed" | "failed"; // Consistent with Video type
    progress: number; // Value between 0-1 (e.g., 0.3 for 30%)
    message?: string; // Now optional
    error?: string; // Error message if status is "failed"
    narration?: string; // Optional narration text for scenes
    imagePrompt?: string; // Optional image prompt for scenes
  }[];
};

export type Voice = {
  id: string;
  name: string;
  labels: {
    [key: string]: string;
  };
  preview_url?: string;
};

export type VideoType = {
  id: string;
  title: string;
  imagePrompt: string;
  prompt: string;
  imageUrl: string;
};

export type ContentType = {
  id: string;
  title: string;
  description: string;
  examples: string[];
  prompt?: string;
  recommendedVoiceId?: string;
};

export interface Scene {
  narration: string;
  imagePrompt: string;
  imageUrl?: string;
  voiceUrl?: string;
  captions?: string;
  captionsWords?: {
    text: string;
    type: "word" | "spacing" | "audio_event";
    start: number;
    end: number;
    speaker_id?: string;
    characters?: {
      text: string;
      start: number;
      end: number;
    }[];
  }[];
}

export type SceneWithTiming = null | {
  startFrame: number;
  pages: TikTokPage[];
  durationInFrames: number;
  scene: Scene;
};

export type VideoStyling = z.infer<typeof TextDesignSchema>;

export interface Video {
  id: string;
  title: string;
  description: string;
  styling: VideoStyling;
  voiceId: string;
  scenes: {
    [sceneIndex: number]: Scene;
  };
  status:
    | "draft"
    | "processing:assets"
    | "processing:upload"
    | "processing:render"
    | "render:complete"
    | "render:error"
    | "assets:ready"
    | "completed"
    | "failed";
  renderStatus: {
    progress: number;
    statusMessage: string;
    videoUrl: string;
  };
  sceneStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed";
      progress: number;
    };
  };
  imageStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed";
      progress: number;
    };
  };
  voiceStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed";
      progress: number;
    };
  };
  createdAt: Date;
}

export type Account = {
  id: string;
  provider: string;
  accountName: string;
  accountId: string;
  createdAt?: Date;
  channelThumbnail: string;
  channelDescription: string;
};
