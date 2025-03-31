export interface VidSparkStats {
  totalVideosCreated: number;
  creditsRemaining: number;
  videosUploaded: number;
  averagePerformance: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface VidSparkVideo {
  id: string;
  title: string;
  status: 'draft' | 'processing' | 'ready' | 'uploaded' | 'failed';
  createdAt: string;
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
} 