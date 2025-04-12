export interface Video {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  thumbnailUrl?: string;
  renderStatus?: {
    statusMessage: string;
    videoUrl?: string;
  };
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