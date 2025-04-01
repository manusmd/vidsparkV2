"use client";

import { Button } from "@/components/ui/button";
import { VideoCard } from "./VideoCard.component";
import { Video as VideoType } from "@/app/types";
import { Video, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ROUTES from "@/lib/routes";

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface RecentVideosSectionProps {
  videos: Video[];
}

export const RecentVideosSection = ({ videos }: RecentVideosSectionProps) => {
  const router = useRouter();
  
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Videos</h2>
        <Button 
          onClick={() => router.push(ROUTES.PAGES.APP.CREATE)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Video
        </Button>
      </div>

      {videos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-muted/30 rounded-lg border border-dashed border-muted">
          <Video className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No videos created yet. Start by creating your first video!
          </p>
          <Button 
            onClick={() => router.push(ROUTES.PAGES.APP.CREATE)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Video
          </Button>
        </div>
      )}
    </div>
  );
}; 