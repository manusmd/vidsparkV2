"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProgressSteps } from "@/components/video/ProgressSteps.component";
import { VideoInfo } from "@/components/video/VideoInfo.component";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { SceneList } from "@/components/video/SceneList.component";
import { VideoPreview } from "@/components/remotion/VideoPreview.component";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { video, steps, loading, error } = useVideoDetail(id as string);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="ml-2 text-lg">Loading video details...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <h1 className="text-2xl font-bold text-destructive">
        {error || "Video not found."}
      </h1>
    );
  }

  return (
    <div className="container relative min-w-screen min-h-screen py-8 px-4 md:px-8 flex gap-8">
      {/* Left Column - Progress & Scenes */}
      <div className="flex-1 space-y-8">
        <ProgressSteps steps={steps} />
        <SceneList scenes={video.scenes} />
      </div>

      {/* Right Column - Video Info & Preview (Sticky within parent) */}
      <div className="relative flex flex-col w-[420px]">
        <div className="sticky top-[96px] space-y-6">
          <VideoInfo video={video} />
          {/* Updated aspect ratio for shorts: 9:16 */}
          <div className="w-full aspect-[9/16] bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
            <VideoPreview scenes={video.scenes} />
          </div>
        </div>
      </div>
    </div>
  );
}
