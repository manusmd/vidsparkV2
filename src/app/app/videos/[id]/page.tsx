"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProgressSteps } from "@/components/video/ProgressSteps.component";
import { VideoInfo } from "@/components/video/VideoInfo.component";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { SceneList } from "@/components/video/SceneList.component";
import { VideoPreview } from "@/components/remotion/VideoPreview.component";
import { VideoProcessingStatus } from "@/components/video/VideoProccessingStatus.component";
import { TextDesignSelector } from "@/components/remotion/TextDesignSelector.component";
import { NextResponse } from "next/server";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { video, steps, loading, error } = useVideoDetail(id as string);

  // This function will be triggered when the "Generate Video" button is clicked.
  const onGenerate = async () => {
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video?.id,
          title: video?.title,
          description: video?.description,
          voiceId: video?.voiceId,
          scenes: video?.scenes,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to trigger video generation",
        );
      }
      console.log("Video generation triggered successfully");
    } catch (error: unknown) {
      console.error("Error triggering video generation:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      {/* Header: Video Info (Sticky on large screens) */}
      <header className="mb-8">
        <div className="sticky top-4 bg-background z-10 p-4 rounded shadow">
          <VideoInfo video={video} />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Progress & Scenes */}
        <section className="flex-1 space-y-8">
          <ProgressSteps
            steps={steps}
            videoStatus={video.status}
            onGenerate={video.status === "draft" ? onGenerate : undefined}
          />
          {/* If the video is not a draft, show the design selector */}
          <SceneList scenes={video.scenes} />
        </section>

        {/* Right Column: Video Preview / Processing Status */}
        <aside className="flex flex-col gap-4 w-full lg:w-[420px]">
          {video.status !== "draft" && <TextDesignSelector />}
          <div className="w-full aspect-[9/16] bg-muted flex items-center justify-center rounded-lg shadow">
            {video.status === "draft" ||
            video.status?.startsWith("processing") ? (
              <VideoProcessingStatus status={video.status} />
            ) : (
              <VideoPreview scenes={video.scenes} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
