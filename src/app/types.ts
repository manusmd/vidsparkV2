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

export type ContentType = {
  id: string;
  title: string;
  description: string;
  examples: string[];
  prompt?: string;
  recommendedVoiceId?: string;
  svgUrl?: string;
};

export interface Video {
  id: string;
  title: string;
  description: string;
  voiceId: string;
  scenes: {
    narration: string;
    imagePrompt: string;
    imageUrl?: string;
    voiceUrl?: string;
  }[];
  status:
    | "processing:voices"
    | "processing:images"
    | "processing:video"
    | "processing:upload"
    | "completed"
    | "failed"; // Explicit status states

  sceneStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed"; // Fixed consistency
      progress: number; // Value between 0 and 1 (e.g., 0.3 for 30%)
    };
  };

  imageStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed"; // Fixed consistency
      progress: number;
    };
  };

  voiceStatus: {
    [sceneIndex: number]: {
      statusMessage: "pending" | "processing" | "completed" | "failed"; // Fixed consistency
      progress: number;
    };
  };

  createdAt: Date;
}
