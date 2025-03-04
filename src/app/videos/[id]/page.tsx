"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProgressSteps } from "@/components/video/ProgressSteps.component";
import { VideoInfo } from "@/components/video/VideoInfo.component";
import { useVideoDetail } from "@/hooks/data/useVideoDetail";
import { Card } from "@/components/ui/card";
import { ImageModal } from "@/components/video/ImageModal.component";
import { AudioPlayer } from "@/components/video/AudioPlayer.component";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { video, steps, loading, error } = useVideoDetail(id as string);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(
    null,
  );

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
    <div className="container min-w-screen min-h-screen py-8 px-4 md:px-8 space-y-8">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Section: Progress Steps */}
        <div className="col-span-2">
          <ProgressSteps steps={steps} />
        </div>

        {/* Right Section: Video Overview & Actions */}
        <div className="col-span-1 space-y-6">
          <VideoInfo video={video} />
        </div>
      </div>

      {/* Scene List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Scenes</h2>
        {video.scenes.map((scene, index) => (
          <Card
            key={index}
            className="p-4 flex items-start gap-4 border border-border rounded-lg"
          >
            {/* Thumbnail */}
            <div className="w-24 h-24 overflow-hidden rounded-lg border border-muted cursor-pointer">
              {scene.imageUrl ? (
                <img
                  src={scene.imageUrl}
                  alt={`Scene ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => {
                    setSelectedImage(scene.imageUrl!);
                    setSelectedSceneIndex(index);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {/* Scene Details */}
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-lg">Scene {index + 1}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {scene.narration}
              </p>

              {/* Audio Player */}
              {scene.voiceUrl ? (
                <AudioPlayer src={scene.voiceUrl} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Voice not generated yet.
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && selectedSceneIndex !== null && (
        <ImageModal
          imageUrl={selectedImage}
          sceneIndex={selectedSceneIndex}
          onClose={() => {
            setSelectedImage(null);
            setSelectedSceneIndex(null);
          }}
        />
      )}
    </div>
  );
}
