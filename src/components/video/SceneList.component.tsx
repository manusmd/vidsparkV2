"use client";

import { useState } from "react";
import { SceneItem } from "@/components/video/SceneItem.component";
import { ImageModal } from "@/components/video/ImageModal.component";
import { Scene } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SceneListProps {
  scenes: { [sceneIndex: number]: Scene };
  loading?: boolean;
}

export function SceneList({ scenes, loading = false }: SceneListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(
    null,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(scenes).map(([sceneIndex, scene]) => (
          <SceneItem
            key={sceneIndex}
            index={Number(sceneIndex)}
            scene={scene}
            onSelectImage={(imageUrl) => {
              setSelectedImage(imageUrl);
              setSelectedSceneIndex(Number(sceneIndex));
            }}
          />
        ))}
      </div>

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
