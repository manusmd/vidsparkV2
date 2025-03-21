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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { CollapsibleSection } from "@/components/layout/CollapsibleSection.component";
import { TextOptions } from "@/components/video/TextOptions.component";
import { MusicSelector } from "@/components/video/MusicSelector.component";
import { MusicTrack } from "@/app/types";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { video, steps, loading, error, stableAssets } = useVideoDetail(
    id as string,
  );
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState<boolean>(true);
  const [textPosition, setTextPosition] = useState<string>("top");
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolume] = useState<number>(0);

  const handleToggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

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
      if (error instanceof Error) {
        console.error("Error triggering video generation:", error);
      } else {
        console.error("Error triggering video generation:", error);
      }
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };

  const onRender = async () => {
    try {
      const response = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video?.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trigger video rendering");
      }
      const result = await response.json();
      console.log("Video rendering triggered successfully:", result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error triggering video rendering:", err);
      } else {
        console.error("Error triggering video rendering:", err);
      }
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
      <div className="flex flex-col gap-4 bg-background z-10 p-4 rounded shadow">
        <VideoInfo video={video} />
        <ProgressSteps
          steps={steps}
          video={video}
          onGenerate={video.status === "draft" ? onGenerate : undefined}
          onRender={onRender}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-4">
        <section className="flex-1 space-y-8">
          <Tabs defaultValue="scenes">
            <TabsList className="mb-4">
              <TabsTrigger value="scenes">Scenes</TabsTrigger>
              <TabsTrigger value="design">Customize</TabsTrigger>
            </TabsList>
            <TabsContent value="scenes">
              <SceneList scenes={video.scenes} />
            </TabsContent>
            <TabsContent value="design">
              <div className="space-y-4">
                <CollapsibleSection
                  id="design"
                  title="Design"
                  isOpen={openSection === "design"}
                  onToggle={handleToggleSection}
                >
                  <TextDesignSelector />
                </CollapsibleSection>
                <CollapsibleSection
                  id="textOptions"
                  title="Text Options"
                  isOpen={openSection === "textOptions"}
                  onToggle={handleToggleSection}
                >
                  <TextOptions
                    textPosition={textPosition}
                    onTextPositionChange={setTextPosition}
                    showTitle={showTitle}
                    onShowTitleChange={setShowTitle}
                  />
                </CollapsibleSection>
                <CollapsibleSection
                  id="music"
                  title="Music Selection"
                  isOpen={openSection === "music"}
                  onToggle={handleToggleSection}
                >
                  <MusicSelector
                    selectedTrack={selectedTrack}
                    onSelectMusic={setSelectedTrack}
                    volume={volume}
                    onVolumeChange={setVolume}
                  />
                </CollapsibleSection>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="w-full lg:w-[420px]">
          <div className="w-full aspect-[9/16] flex items-center justify-center rounded-lg shadow">
            {video.status === "draft" ||
            video.status === "processing:assets" ? (
              <VideoProcessingStatus status={video.status} />
            ) : (
              <VideoPreview
                scenes={stableAssets?.scenes || {}}
                styling={stableAssets?.styling || {}}
                textPosition={textPosition}
                showTitle={showTitle}
                title={video.title}
                musicVolume={volume}
                musicUrl={selectedTrack?.src}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
