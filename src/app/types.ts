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

export interface MusicTrack {
  id: string;
  title: string;
  src: string;
}

export type ImageType = {
  id: string;
  title: string;
  description: string;
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
  order?: number;
  imageUrl?: string;    // URL to the content type's image
  imagePrompt?: string; // Prompt used to generate the image
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
  narration?: string;
  templateId?: string; // Reference to the template this video was created from
  voiceId: string;
  contentTypeId?: string;
  imageStyleId?: string;
  scenes: {
    [key: number]: Scene;
  };
  styling: {
    font: string;
    variant: string;
  } | null;
  textPosition: "top" | "middle" | "bottom";
  showTitle?: boolean;
  musicVolume: number;
  musicUrl: string | null;
  musicId?: string | null;
  uploadStatus?: {
    youtube?: {
      progress: number;
      videoId: string | null;
      videoUrl: string | null;
    }
  };
  status:
    | "draft"
    | "processing:assets"
    | "processing:upload"
    | "processing:render"
    | "processing:story"
    | "processing:video"
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

export interface VideoTemplate {
  id: string;
  name: string;
  userId: string;
  contentTypeId: string;
  imageStyleId: string;
  voiceId: string;
  styling: {
    font: string;
    variant: string;
  };
  textPosition: "top" | "middle" | "bottom";
  showTitle: boolean;
  musicId: string;
  musicVolume?: number;
  defaultNarration?: string;
  createdAt: string;
  lastUsedAt: string | Date;
}

export type Account = {
  id: string;
  accountId: string;
  accountName: string;
  channelDescription: string;
  channelThumbnail: string;
  createdAt: string;
  provider: string;
  refreshToken: string;
  token: string;
  userId: string;
};
