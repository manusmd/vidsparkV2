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